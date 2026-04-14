package backendtela.service;

import backendtela.entidades.Pagamentos;
import backendtela.enums.Status;
import backendtela.repository.PagamentoRepository;
import backendtela.repository.PedidoRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.UUID;

@Slf4j
@Service
public class WebhookService {

    private static final Pattern DATA_ID_PATTERN = Pattern.compile("\"data\"\\s*:\\s*\\{[^}]*?\"id\"\\s*:\\s*\"?([^\",}\\s]+)\"?");
    private static final Pattern GENERIC_ID_PATTERN = Pattern.compile("\"id\"\\s*:\\s*\"?([^\",}\\s]+)\"?");

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;
    
    @Value("${mercadopago.webhook-secret:webhook-secret-test-local}")
    private String webhookSecret;

    public WebhookService(PagamentoRepository pagamentoRepository, PedidoRepository pedidoRepository) {
        this.pagamentoRepository = pagamentoRepository;
        this.pedidoRepository = pedidoRepository;
    }

    public Payment buscarPagamento(String paymentId) throws Exception {
        PaymentClient client = new PaymentClient();
        return client.get(Long.parseLong(paymentId));
    }

    public void processarWebhook(Map<String, Object> payload) {
        String paymentId = extrairPaymentId(payload);
        processarPagamento(paymentId, null);
    }

    public void processarWebhook(String payload, String signature) throws IllegalStateException {
        // Validar assinatura HMAC SHA256
        if (webhookSecret != null && !webhookSecret.isBlank() && signature != null && !signature.isBlank()) {
            if (!validarAssinatura(payload, signature)) {
                log.warn("⚠️  Webhook recebido com assinatura INVÁLIDA. Rejeitado.");
                throw new IllegalStateException("Assinatura do webhook inválida");
            }
        } else {
            log.debug("Webhook sem validação de assinatura (webhook-secret não configurado)");
        }
        
        String paymentId = extrairPaymentId(payload);
        processarPagamento(paymentId, signature);
    }
    
    private boolean validarAssinatura(String payload, String signature) {
        try {
            String hash = gerarHMACSHA256(payload, webhookSecret);
            // MP envia hash no formato timestamp-hash
            String[] parts = signature.split("-");
            if (parts.length == 2) {
                return hash.equals(parts[1]);
            }
            return false;
        } catch (Exception e) {
            log.error("Erro ao validar assinatura do webhook", e);
            return false;
        }
    }
    
    private String gerarHMACSHA256(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(), "HmacSHA256");
        mac.init(keySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes());
        return bytesToHex(rawHmac);
    }
    
    private String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private void processarPagamento(String paymentId, String signature) {
        if (paymentId == null || paymentId.isBlank()) {
            log.debug("Webhook recebido sem paymentId. Signature={}", signature);
            return;
        }

        try {
            Payment payment = buscarPagamento(paymentId);
            Status statusPagamento = mapStatus(payment.getStatus());
            String statusPedido = mapStatusPedido(statusPagamento);

            String pedidoId = extrairPedidoId(payment);
            if (pedidoId == null || pedidoId.isBlank()) {
                return;
            }

            Optional<Pagamentos> pagamentoExistente = pagamentoRepository.findByPedidoId(pedidoId);
            if (pagamentoExistente.isPresent()) {
                Pagamentos registro = pagamentoExistente.get();
                pagamentoRepository.updateStatusAndTransaction(
                        registro.getIdPagamento(),
                        paymentId,
                        statusPagamento.name()
                );
            } else {
                Pagamentos novo = new Pagamentos();
                novo.setIdPagamento(UUID.randomUUID().toString());
                novo.setPedidoId(pedidoId);
                novo.setTransactionId(paymentId);
                novo.setStatus(statusPagamento);
                if (payment.getTransactionAmount() != null) {
                    novo.setValor(payment.getTransactionAmount());
                }
                pagamentoRepository.save(novo);
            }

            pedidoRepository.updateStatus(pedidoId, statusPedido);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao processar webhook do Mercado Pago", e);
        }
    }

    private String extrairPaymentId(Map<String, Object> payload) {
        Object dataObj = payload.get("data");
        if (dataObj instanceof Map<?, ?> dataMap) {
            Object id = dataMap.get("id");
            if (id != null) {
                return String.valueOf(id);
            }
        }

        Object id = payload.get("id");
        return id == null ? null : String.valueOf(id);
    }

    private String extrairPaymentId(String payload) {
        if (payload == null || payload.isBlank()) {
            return null;
        }

        Matcher dataMatcher = DATA_ID_PATTERN.matcher(payload);
        if (dataMatcher.find()) {
            return dataMatcher.group(1);
        }

        Matcher genericMatcher = GENERIC_ID_PATTERN.matcher(payload);
        if (genericMatcher.find()) {
            return genericMatcher.group(1);
        }

        return null;
    }

    private String extrairPedidoId(Payment payment) {
        Object metadata = payment.getMetadata();
        if (metadata instanceof Map<?, ?> metadataMap) {
            Object pedidoId = metadataMap.get("pedidoId");
            if (pedidoId != null) {
                return String.valueOf(pedidoId);
            }
        }

        String descricao = payment.getDescription();
        if (descricao != null && descricao.startsWith("Pedido ")) {
            return descricao.substring("Pedido ".length()).trim();
        }

        return null;
    }

    private Status mapStatus(String mercadoPagoStatus) {
        if (mercadoPagoStatus == null) {
            return Status.PENDENTE;
        }

        String normalized = mercadoPagoStatus.toLowerCase(Locale.ROOT);
        if ("approved".equals(normalized)) {
            return Status.PAGO;
        }
        if ("in_process".equals(normalized) || "pending".equals(normalized)) {
            return Status.PENDENTE;
        }
        if ("cancelled".equals(normalized) || "rejected".equals(normalized) || "refunded".equals(normalized)) {
            return Status.CANCELADO;
        }
        return Status.PENDENTE;
    }

    private String mapStatusPedido(Status statusPagamento) {
        if (statusPagamento == Status.PAGO) {
            return "PAGO";
        }
        if (statusPagamento == Status.CANCELADO) {
            return "CANCELADO";
        }
        return "PENDENTE";
    }
}
