package backendtela.service;

import backendtela.entidades.Pagamentos;
import backendtela.enums.Status;
import backendtela.repository.PagamentoRepository;
import backendtela.repository.PedidoRepository;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.resources.payment.Payment;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class WebhookService {

    private final PagamentoRepository pagamentoRepository;
    private final PedidoRepository pedidoRepository;

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
        if (paymentId == null || paymentId.isBlank()) {
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
