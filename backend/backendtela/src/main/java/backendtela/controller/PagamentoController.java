package backendtela.controller;

import backendtela.dto.CriarPagamentoDTO;
import backendtela.dto.PagamentoCartaoDTO;
import backendtela.service.PagamentoService;
import com.mercadopago.resources.payment.Payment;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Payment> pagarPix(@Valid @RequestBody CriarPagamentoDTO dto) {
        try {
            log.info("Processando pagamento PIX para pedido: {} - Valor: {}", dto.getPedidoId(), dto.getValor());
            Payment payment = pagamentoService.pagarPix(dto);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (IllegalStateException e) {
            log.error("Erro de configuração de MercadoPago: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.PRECONDITION_FAILED).body(null);
        } catch (Exception e) {
            log.error("Erro ao processar pagamento PIX", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
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
     * Webhook do MercadoPago para notificações de pagamento.
     * Chamado automaticamente quando há atualizações no pagamento.
     */
    @PostMapping("/webhook")
    public ResponseEntity<Void> webhook(@RequestBody String payload, @RequestHeader("x-signature") String signature) {
        try {
            log.info("Webhook recebido do MercadoPago");
            pagamentoService.processarWebhook(payload, signature);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Erro ao processar webhook", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
