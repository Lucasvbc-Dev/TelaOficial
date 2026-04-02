package backendtela.service;

import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import backendtela.dto.ItemPedidoDTO;
import backendtela.dto.PedidoAdminResponseDTO;
import backendtela.dto.PedidoDTO;
import backendtela.entidades.ItemPedido;
import backendtela.entidades.Pedidos;
import backendtela.repository.PedidoRepository;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class PedidoService {

    private final PedidoRepository repository;

    public PedidoService(PedidoRepository repository) {
        this.repository = repository;
    }

    /**
     * Criar novo pedido para cliente.
     */
    public Pedidos criarPedido(PedidoDTO dto) {
        log.info("Criando pedido para usuário: {}", dto.getUsuarioId());
        
        try {
            List<ItemPedido> itens = dto.getItens()
                    .stream()
                    .map(this::mapItem)
                    .collect(Collectors.toList());

            BigDecimal total = calcularTotal(itens);

            Pedidos pedido = new Pedidos();
            pedido.setId(UUID.randomUUID().toString());
            pedido.setUsuarioId(dto.getUsuarioId());
            pedido.setItens(itens);
            pedido.setTotal(total);
            pedido.setStatus("PENDENTE");
            pedido.setCreatedAt(Timestamp.from(LocalDateTime.now().atZone(ZoneId.systemDefault()).toInstant()));

            repository.save(pedido);
            log.info("Pedido criado: {} - Total: {}", pedido.getId(), total);
            
            return pedido;
        } catch (Exception e) {
            log.error("Erro ao criar pedido: ", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erro ao criar pedido: " + e.getMessage());
        }
    }

    /**
     * Buscar pedido por ID.
     */
    public Pedidos buscarPorId(String pedidoId) {
        log.debug("Buscando pedido: {}", pedidoId);
        return repository.findById(pedidoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido não encontrado"));
    }

    /**
     * Listar todos os pedidos (admin).
     */
    public List<PedidoAdminResponseDTO> listarPedidosAdmin() {
        log.info("Admin listando todos os pedidos");
        
        List<Pedidos> pedidos = repository.findAll();

        return pedidos.stream().map(pedido -> {
            try {
                var userDoc = repository.getDB().collection("usuarios")
                        .document(pedido.getUsuarioId())
                        .get()
                        .get();

                String nome = userDoc.getString("nome");
                String email = userDoc.getString("email");
                String endereco = userDoc.getString("endereco");

                List<ItemPedidoDTO> itens = pedido.getItens().stream()
                        .map(item -> new ItemPedidoDTO(
                                item.getProdutoId(),
                                item.getNome(),
                                item.getPreco(),
                                item.getQuantidade()
                        ))
                        .toList();

                return new PedidoAdminResponseDTO(
                        pedido.getId(),
                        nome,
                        email,
                        endereco,
                        itens,
                        pedido.getTotal(),
                        pedido.getStatus(),
                    pedido.getCreatedAt() == null ? null : pedido.getCreatedAt().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime()
                );

            } catch (Exception e) {
                log.error("Erro ao montar pedido admin: {}", pedido.getId(), e);
                throw new RuntimeException("Erro ao montar pedido admin", e);
            }
        }).toList();
    }

    /**
     * Atualizar status do pedido.
     */
    public void atualizarStatusPedido(String pedidoId, String novoStatus) {
        buscarPorId(pedidoId); // Valida se existe
        
        log.info("Atualizando status do pedido: {} para {}", pedidoId, novoStatus);
        try {
            repository.updateStatus(pedidoId, novoStatus);
        } catch (Exception e) {
            log.error("Erro ao atualizar status do pedido: {}", pedidoId, e);
            throw new RuntimeException("Não foi possível atualizar status do pedido", e);
        }
    }

    /**
     * Listar pedidos por usuário.
     */
    public List<Pedidos> listarPedidosPorUsuario(String usuarioId) {
        log.debug("Listando pedidos do usuário: {}", usuarioId);
        return repository.findByUsuarioId(usuarioId);
    }

    /**
     * Mapear ItemPedidoDTO para ItemPedido.
     * Aceita qualquer produto (mesmo que não exista no Firebase)
     */
    private ItemPedido mapItem(ItemPedidoDTO dto) {
        // Log. dos dados recebidos
        log.info("Mapeando item: produtoId={}, nome={}, preco={}, quantidade={}", 
                dto.getProdutoId(), dto.getNome(), dto.getPreco(), dto.getQuantidade());
        
        ItemPedido item = new ItemPedido();
        item.setProdutoId(dto.getProdutoId());
        item.setNome(dto.getNome());
        item.setPreco(dto.getPreco());
        item.setQuantidade(dto.getQuantidade());
        
        log.info("Item mapeado com sucesso");
        return item;
    }

    /**
     * Calcular valor total do pedido.
     */
    private BigDecimal calcularTotal(List<ItemPedido> itens) {
        return itens.stream()
                .map(i -> i.getPreco().multiply(BigDecimal.valueOf(i.getQuantidade())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
