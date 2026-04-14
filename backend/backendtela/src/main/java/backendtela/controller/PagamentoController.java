package backendtela.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mercadopago.resources.payment.Payment;

import backendtela.dto.CriarPagamentoDTO;
import backendtela.dto.CriarPreferenciaPagamentoDTO;
import backendtela.dto.PagamentoCartaoDTO;
import backendtela.dto.PreferenciaPagamentoResponseDTO;
import backendtela.service.PagamentoService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller de Pagamentos.
 * Suporta PIX e Cartão de Crédito via MercadoPago.
 */
@Slf4j
@RestController
@RequestMapping("/pagamentos")
@CrossOrigin
public class PagamentoController {

    private final PagamentoService pagamentoService;

    public PagamentoController(PagamentoService pagamentoService) {
        this.pagamentoService = pagamentoService;
    }

    /**
     * Criar pagamento via PIX.
     * Retorna QR Code para o cliente ler e escanear.
     */
    @PostMapping("/pix")
    public ResponseEntity<?> pagarPix(@Valid @RequestBody CriarPagamentoDTO dto) {
        try {
            log.info("Processando pagamento PIX para pedido: {} - Valor: {}", dto.getPedidoId(), dto.getValor());
            Payment payment = pagamentoService.pagarPix(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (IllegalStateException e) {
            log.error("Erro de configuração de MercadoPago: {}", e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("HTTP 401")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Credenciais Mercado Pago inválidas para PIX (live). Use token/public key válidos do mesmo app/conta."));
            }
            if (e.getMessage() != null && e.getMessage().contains("Collector user without key enabled for QR")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("message", "Sua conta do Mercado Pago ainda não está habilitada para QR PIX direto via API. Ative uma chave PIX na conta ou use Checkout Pro para PIX."));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao processar pagamento PIX", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage() == null ? "Erro ao processar pagamento PIX" : e.getMessage()));
        }
    }

    /**
     * Criar pagamento via Cartão de Crédito.
     * Suporta parcelamento de 1 a 12 vezes.
     */
    @PostMapping("/cartao")
    public ResponseEntity<Payment> pagarCartao(@Valid @RequestBody PagamentoCartaoDTO dto) {
        try {
            log.info("Processando pagamento com cartão para pedido: {} - Valor: {} - Parcelas: {}", 
                    dto.getPedidoId(), dto.getValor(), dto.getInstallments());
            Payment payment = pagamentoService.pagarCartao(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (IllegalStateException e) {
            log.error("Erro de configuração de MercadoPago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(null);
        } catch (Exception e) {
            log.error("Erro ao processar pagamento com cartão", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
    }

    /**
     * Criar preferência do Checkout Pro para redirecionar ao Mercado Pago.
     */
    @PostMapping("/checkout-pro")
    public ResponseEntity<?> criarCheckoutPro(@Valid @RequestBody CriarPreferenciaPagamentoDTO dto) {
        try {
            log.info("Criando checkout pro para pedido: {}", dto.getPedidoId());
            PreferenciaPagamentoResponseDTO response = pagamentoService.criarPreferenciaCheckoutPro(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            log.error("Erro de configuração de MercadoPago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao criar checkout pro", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Erro ao criar checkout do Mercado Pago"));
        }
    }

    /**
     * Webhook do MercadoPago para notificações de pagamento.
     * Chamado automaticamente quando há atualizações no pagamento.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload, @RequestHeader(value = "x-signature", required = false) String signature) {
        try {
            log.info("Webhook recebido do MercadoPago");
            pagamentoService.processarWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            log.warn("Webhook rejeitado: assinatura inválida");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        } catch (Exception e) {
            log.error("Erro ao processar webhook", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{paymentId}/status")
    public ResponseEntity<?> consultarStatusPagamento(@PathVariable String paymentId) {
        try {
            Payment payment = pagamentoService.consultarPagamento(paymentId);
            return ResponseEntity.ok(Map.of(
                    "paymentId", paymentId,
                    "status", payment.getStatus() == null ? "pending" : payment.getStatus()
            ));
        } catch (Exception e) {
            log.error("Erro ao consultar status do pagamento {}", paymentId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Não foi possível consultar o status do pagamento"));
        }
    }
}
