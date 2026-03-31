package backendtela.service;

import backendtela.dto.CriarPagamentoDTO;
import backendtela.dto.PagamentoCartaoDTO;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.resources.payment.Payment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class MercadoPagoService {

    private final PaymentClient client = new PaymentClient();

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

        return client.create(request);
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

    private void validarConfiguracao() {
        if (accessToken == null || accessToken.isBlank()) {
            throw new IllegalStateException("Mercado Pago nao configurado. Defina mercadopago.access-token.");
        }
    }
}
