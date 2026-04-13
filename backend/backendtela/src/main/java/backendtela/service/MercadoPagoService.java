package backendtela.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.resources.payment.Payment;

import backendtela.dto.CriarPagamentoDTO;
import backendtela.dto.CriarPreferenciaPagamentoDTO;
import backendtela.dto.ItemPedidoDTO;
import backendtela.dto.PagamentoCartaoDTO;
import backendtela.dto.PreferenciaPagamentoResponseDTO;

@Service
public class MercadoPagoService {

    private final PaymentClient client = new PaymentClient();

    @Value("${mercadopago.base-url:https://api.mercadopago.com}")
    private String baseUrl;

    @Value("${mercadopago.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${mercadopago.backend-url:http://localhost:8080}")
    private String backendUrl;

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    // 🔹 PIX
    public Payment criarPagamentoPix(CriarPagamentoDTO dto) throws Exception {
        validarConfiguracao();

        PaymentPayerRequest payer = PaymentPayerRequest.builder()
                .email(dto.getEmail())
                .build();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("pedidoId", dto.getPedidoId());

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .transactionAmount(dto.getValor())
                .description("Pedido " + dto.getPedidoId())
                .paymentMethodId("pix")
                .payer(payer)
                .metadata(metadata)
                .build();

        try {
            return client.create(request);
        } catch (MPApiException e) {
            String detalhe = e.getApiResponse() != null
                    ? "HTTP " + e.getApiResponse().getStatusCode() + " - " + e.getApiResponse().getContent()
                    : e.getMessage();
            throw new IllegalStateException("Mercado Pago rejeitou PIX: " + detalhe, e);
        }
    }

    public Payment criarPagamentoCartao(PagamentoCartaoDTO dto) throws Exception {
        validarConfiguracao();

        PaymentPayerRequest payer = PaymentPayerRequest.builder()
                .email(dto.getEmail())
                .build();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("pedidoId", dto.getPedidoId());

        PaymentCreateRequest request = PaymentCreateRequest.builder()
                .transactionAmount(dto.getValor())
                .token(dto.getToken())
                .installments(dto.getInstallments())
                .description("Pedido " + dto.getPedidoId())
                .payer(payer)
                .metadata(metadata)
                .build();

        return client.create(request);
    }

    public PreferenciaPagamentoResponseDTO criarPreferenciaCheckoutPro(CriarPreferenciaPagamentoDTO dto) {
        validarConfiguracao();

        List<Map<String, Object>> items = dto.getItens().stream()
                .map(this::mapearItemPreferencia)
                .toList();

        Map<String, Object> body = new HashMap<>();
        body.put("items", items);
        body.put("external_reference", dto.getPedidoId());
        body.put("payer", Map.of("email", dto.getEmail()));
        body.put("payment_methods", montarPaymentMethods(dto.getMetodoPagamento()));

        if (isPublicHttpsUrl(frontendUrl)) {
            body.put("back_urls", Map.of(
                "success", construirBackUrl(),
                "pending", construirBackUrl(),
                "failure", construirBackUrl()
            ));
            body.put("auto_return", "approved");
        }

        if (isPublicHttpsUrl(backendUrl)) {
            body.put("notification_url", construirNotificationUrl());
        }

        try {
            Map<?, ?> response = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken.trim())
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .build()
                    .post()
                    .uri("/checkout/preferences")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null) {
                throw new IllegalStateException("Não foi possível criar a preferência de pagamento");
            }

            return new PreferenciaPagamentoResponseDTO(
                    response.get("id") == null ? null : String.valueOf(response.get("id")),
                    response.get("init_point") == null ? null : String.valueOf(response.get("init_point")),
                    response.get("sandbox_init_point") == null ? null : String.valueOf(response.get("sandbox_init_point"))
            );
        } catch (RestClientResponseException e) {
            throw new IllegalStateException("Mercado Pago rejeitou checkout: HTTP " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);
        }
    }

    private void validarConfiguracao() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("Mercado Pago nao configurado. Defina mercadopago.access-token.");
        }
    }

    private Map<String, Object> mapearItemPreferencia(ItemPedidoDTO item) {
        Map<String, Object> mapped = new HashMap<>();
        mapped.put("title", item.getNome());
        mapped.put("quantity", item.getQuantidade());
        mapped.put("unit_price", item.getPreco());
        mapped.put("currency_id", "BRL");
        return mapped;
    }

    private Map<String, Object> montarPaymentMethods(String metodoPagamento) {
        String metodo = metodoPagamento == null ? "" : metodoPagamento.trim().toLowerCase();
        List<Map<String, String>> excludedPaymentTypes;

        switch (metodo) {
            case "pix" -> {
            excludedPaymentTypes = List.of(
                Map.of("id", "credit_card"),
                Map.of("id", "debit_card"),
                Map.of("id", "ticket"),
                Map.of("id", "atm")
            );
            return Map.of(
                "excluded_payment_types", excludedPaymentTypes
            );
            }
            case "credito" -> excludedPaymentTypes = List.of(
                    Map.of("id", "debit_card"),
                    Map.of("id", "bank_transfer"),
                    Map.of("id", "ticket")
            );
            case "debito" -> excludedPaymentTypes = List.of(
                    Map.of("id", "credit_card"),
                    Map.of("id", "bank_transfer"),
                    Map.of("id", "ticket")
            );
            default -> {
                return Map.of();
            }
        }

        return Map.of(
                "excluded_payment_types", excludedPaymentTypes
        );
    }

    private String construirBackUrl() {
        String base = frontendUrl == null || frontendUrl.isBlank() ? "http://localhost:5173" : frontendUrl.trim();
        return base.endsWith("/") ? base.substring(0, base.length() - 1) + "/meus-pedidos" : base + "/meus-pedidos";
    }

    private String construirNotificationUrl() {
        String base = backendUrl == null || backendUrl.isBlank() ? "http://localhost:8080" : backendUrl.trim();
        return base.endsWith("/") ? base.substring(0, base.length() - 1) + "/pagamentos/webhook" : base + "/pagamentos/webhook";
    }

    private boolean isPublicHttpsUrl(String url) {
        return url != null && !url.isBlank() && url.trim().startsWith("https://");
    }
}
