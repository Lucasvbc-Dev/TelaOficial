package backendtela.controller;

import backendtela.dto.AtualizarStatusPedidoDTO;
import backendtela.dto.PedidoAdminResponseDTO;
import backendtela.dto.PedidoDTO;
import backendtela.entidades.Pedidos;
import backendtela.service.PedidoService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/pedidos")
@CrossOrigin
public class PedidoController {

    private final PedidoService service;

    public PedidoController(PedidoService service) {
        this.service = service;
    }

    /**
     * Criar novo pedido.
     */
    @PostMapping
    public ResponseEntity<Pedidos> criarPedido(
            @Valid @RequestBody PedidoDTO pedidoDTO,
            Authentication authentication
    ) {
        if (pedidoDTO.getUsuarioId() != null && !pedidoDTO.getUsuarioId().isBlank()
                && !pedidoDTO.getUsuarioId().equals(authentication.getName())
                && !isAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Não é permitido criar pedido para outro usuário");
        }

        pedidoDTO.setUsuarioId(authentication.getName());
        log.info("Criando novo pedido para usuário: {}", authentication.getName());
        Pedidos pedido = service.criarPedido(pedidoDTO);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(pedido);
    }

    /**
     * Listar todos os pedidos (admin only).
     */
    @GetMapping("/admin")
    public ResponseEntity<List<PedidoAdminResponseDTO>> listarPedidosAdmin(Authentication authentication) {
        validarAdmin(authentication);
        log.info("Admin listando todos os pedidos");
        return ResponseEntity.ok(service.listarPedidosAdmin());
    }

    /**
     * Atualizar status do pedido (admin only).
     */
    @PatchMapping("/admin/{pedidoId}/status")
    public ResponseEntity<Void> atualizarStatus(
            @PathVariable String pedidoId,
            @Valid @RequestBody AtualizarStatusPedidoDTO dto,
            Authentication authentication
    ) {
        validarAdmin(authentication);
        log.info("Admin atualizando status do pedido: {} para {}", pedidoId, dto.getStatus());
        service.atualizarStatusPedido(pedidoId, dto.getStatus());
        return ResponseEntity.noContent().build();
    }

    /**
     * Listar pedidos do usuário autenticado.
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<Pedidos>> listarPorUsuario(
            @PathVariable String usuarioId,
            Authentication authentication
    ) {
        if (!isAdmin(authentication) && !usuarioId.equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para visualizar pedidos deste usuário");
        }
        
        log.info("Listando pedidos do usuário: {}", usuarioId);
        return ResponseEntity.ok(service.listarPedidosPorUsuario(usuarioId));
    }

    /**
     * Buscar pedido por ID.
     */
    @GetMapping("/{pedidoId}")
    public ResponseEntity<Pedidos> buscarPorId(
            @PathVariable String pedidoId,
            Authentication authentication
    ) {
        Pedidos pedido = service.buscarPorId(pedidoId);
        
        // Validar se o usuário tem permissão para visualizar
        if (!isAdmin(authentication) && !pedido.getUsuarioId().equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissão para visualizar este pedido");
        }

        log.info("Buscando pedido: {}", pedidoId);
        return ResponseEntity.ok(pedido);
    }

    /**
     * Validar se usuário é admin.
     */
    private void validarAdmin(Authentication authentication) {
        if (!isAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso restrito a administradores");
        }
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
    }
}

