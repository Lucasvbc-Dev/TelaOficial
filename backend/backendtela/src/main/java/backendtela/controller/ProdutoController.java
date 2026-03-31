package backendtela.controller;

import backendtela.dto.ProdutoDTO;
import backendtela.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/produtos")
@CrossOrigin
public class ProdutoController {

    private final ProdutoService service;

    public ProdutoController(ProdutoService service) {
        this.service = service;
    }

    /**
     * Listar todos os produtos com paginação.
     * Apenas produtos ativos são listados publicamente.
     */
    @GetMapping
    public ResponseEntity<Page<ProdutoDTO>> listarProdutos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String busca
    ) {
        log.info("Listando produtos - page: {}, size: {}, categoria: {}, busca: {}", page, size, categoria, busca);
        
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        Page<ProdutoDTO> produtos = service.listarProdutos(pageable, categoria, busca);
        
        return ResponseEntity.ok(produtos);
    }

    /**
     * Buscar produto por ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProdutoDTO> buscarPorId(@PathVariable String id) {
        log.info("Buscando produto: {}", id);
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    /**
     * Listar todos os produtos (admin).
     * Inclui produtos inativos.
     */
    @GetMapping("/admin/todos")
    public ResponseEntity<List<ProdutoDTO>> listarTodosProdutosAdmin(Authentication authentication) {
        validarAdmin(authentication);
        log.info("Admin listando todos os produtos");
        return ResponseEntity.ok(service.listarTodosProdutos());
    }

    /**
     * Criar novo produto (admin only).
     */
    @PostMapping
    public ResponseEntity<ProdutoDTO> criar(
            @Valid @RequestBody ProdutoDTO produto,
            Authentication authentication
    ) {
        validarAdmin(authentication);
        log.info("Admin criando novo produto: {}", produto.getNome());
        ProdutoDTO produtoCriado = service.salvar(produto);
        return ResponseEntity.status(HttpStatus.CREATED).body(produtoCriado);
    }

    /**
     * Atualizar produto (admin only).
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProdutoDTO> atualizar(
            @PathVariable String id,
            @Valid @RequestBody ProdutoDTO produto,
            Authentication authentication
    ) {
        validarAdmin(authentication);
        log.info("Admin atualizando produto: {}", id);
        ProdutoDTO produtoAtualizado = service.atualizar(id, produto);
        return ResponseEntity.ok(produtoAtualizado);
    }

    /**
     * Deletar produto (admin only).
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(
            @PathVariable String id,
            Authentication authentication
    ) {
        validarAdmin(authentication);
        log.info("Admin deletando produto: {}", id);
        service.deletar(id);
    }

    /**
     * Validar se o usuário é admin.
     */
    private void validarAdmin(Authentication authentication) {
        boolean admin = authentication != null && authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);

        if (!admin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas administradores podem acessar este recurso");
        }
    }
}


