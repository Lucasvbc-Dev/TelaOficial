package backendtela.service;

import backendtela.dto.ProdutoDTO;
import backendtela.repository.ProdutoRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ProdutoService {

    private final ProdutoRepository repository;

    public ProdutoService(ProdutoRepository repository) {
        this.repository = repository;
    }

    /**
     * Buscar todos os produtos com paginação (apenas ativos).
     */
    public Page<ProdutoDTO> listarProdutos(Pageable pageable, String categoria, String busca) {
        log.debug("Listando produtos - categoria: {}, busca: {}", categoria, busca);
        return repository.findAtivos(pageable, categoria, busca);
    }

    /**
     * Listar todos os produtos sem paginação (admin).
     */
    public List<ProdutoDTO> listarTodosProdutos() {
        log.debug("Listando todos os produtos (admin)");
        return repository.findAll();
    }

    /**
     * Buscar produto por ID.
     */
    public ProdutoDTO buscarPorId(String id) {
        log.debug("Buscando produto por ID: {}", id);
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado"));
    }

    /**
     * Salvar novo produto.
     */
    public ProdutoDTO salvar(ProdutoDTO produto) {
        String id = UUID.randomUUID().toString();
        produto.setId(id);
        produto.setCreatedAt(LocalDateTime.now());
        produto.setUpdatedAt(LocalDateTime.now());
        
        log.info("Salvando novo produto: {} (ID: {})", produto.getNome(), id);
        repository.save(produto);
        
        return produto;
    }

    /**
     * Atualizar produto existente.
     */
    public ProdutoDTO atualizar(String id, ProdutoDTO produtoAtualizado) {
        ProdutoDTO produtoExistente = buscarPorId(id);
        
        produtoAtualizado.setId(id);
        produtoAtualizado.setCreatedAt(produtoExistente.getCreatedAt());
        produtoAtualizado.setUpdatedAt(LocalDateTime.now());
        
        log.info("Atualizando produto: {} (ID: {})", produtoAtualizado.getNome(), id);
        repository.update(id, produtoAtualizado);
        
        return produtoAtualizado;
    }

    /**
     * Deletar produto por ID.
     */
    public void deletar(String id) {
        buscarPorId(id); // Valida se existe
        log.info("Deletando produto: {}", id);
        repository.deleteById(id);
    }
}
