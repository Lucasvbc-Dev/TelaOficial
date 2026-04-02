package backendtela.service;

import backendtela.dto.CriarPagamentoDTO;
import backendtela.dto.CriarPreferenciaPagamentoDTO;
import backendtela.dto.PagamentoCartaoDTO;
import backendtela.dto.PreferenciaPagamentoResponseDTO;
import backendtela.entidades.Pagamentos;
import backendtela.enums.Metodo;
import backendtela.enums.Status;
import backendtela.repository.PagamentoRepository;
import com.mercadopago.resources.payment.Payment;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.UUID;

@Slf4j
@Service
public class PagamentoService {

    private final MercadoPagoService mercadoPagoService;
    private final PagamentoRepository pagamentoRepository;

    public PagamentoService(MercadoPagoService mercadoPagoService, PagamentoRepository pagamentoRepository) {
        this.mercadoPagoService = mercadoPagoService;
        this.pagamentoRepository = pagamentoRepository;
    }

    /**
     * Processar pagamento via PIX.
     */
    public Payment pagarPix(CriarPagamentoDTO dto) throws Exception {
        Payment payment = mercadoPagoService.criarPagamentoPix(dto);
        salvarRegistroPagamento(dto.getPedidoId(), dto.getValor(), Metodo.PIX, payment);
        return payment;
    }

    /**
     * Processar pagamento via Cartão de Crédito.
     */
    public Payment pagarCartao(PagamentoCartaoDTO dto) throws Exception {
        Payment payment = mercadoPagoService.criarPagamentoCartao(dto);
        salvarRegistroPagamento(dto.getPedidoId(), dto.getValor(), Metodo.CARTAO_DE_CREDITO, payment);
        return payment;
    }

    /**
     * Criar preferência do Checkout Pro para redirecionar o cliente ao Mercado Pago.
     */
    public PreferenciaPagamentoResponseDTO criarPreferenciaCheckoutPro(CriarPreferenciaPagamentoDTO dto) {
        return mercadoPagoService.criarPreferenciaCheckoutPro(dto);
    }

    /**
     * Processar webhook do MercadoPago.
     * Valida a assinatura e atualiza o status do pagamento.
     */
    public void processarWebhook(String payload, String signature) throws Exception {
        log.info("Processando webhook do MercadoPago");
        
        // TODO: Validar assinatura do webhook
        // A validação deve incluir:
        // 1. Recuperar o public_key do MercadoPago
        // 2. Validar HMAC SHA256
        // 3. Verificar se o timestamp está dentro de 10 minutos
        
        // Por enquanto, apenas logamos
        log.debug("Payload recebido: {}", payload);
    }

    /**
     * Salvar registro de pagamento no banco de dados.
     */
    private void salvarRegistroPagamento(String pedidoId, java.math.BigDecimal valor, Metodo metodo, Payment payment) {
        Pagamentos registro = new Pagamentos();
        registro.setIdPagamento(UUID.randomUUID().toString());
        registro.setPedidoId(pedidoId);
        registro.setValor(valor);
        registro.setMetodo(metodo);
        registro.setTransactionId(payment.getId() == null ? null : String.valueOf(payment.getId()));
        registro.setStatus(mapStatus(payment.getStatus()));

        pagamentoRepository.save(registro);
        log.info("Pagamento registrado: ID={}, Status={}", registro.getIdPagamento(), registro.getStatus());
    }

    /**
     * Mapear status do MercadoPago para Status local.
     */
    private Status mapStatus(String mpStatus) {
        if (mpStatus == null) {
            return Status.PENDENTE;
        }

        String normalized = mpStatus.toLowerCase(Locale.ROOT);
        if ("approved".equals(normalized)) {
            return Status.PAGO;
        }
        if ("cancelled".equals(normalized) || "rejected".equals(normalized)) {
            return Status.CANCELADO;
        }
        return Status.PENDENTE;
    }
}

