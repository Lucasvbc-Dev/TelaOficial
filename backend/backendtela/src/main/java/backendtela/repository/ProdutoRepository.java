package backendtela.repository;

import backendtela.dto.ProdutoDTO;
import com.google.cloud.firestore.CollectionReference;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.Query;
import com.google.cloud.firestore.QuerySnapshot;
import com.google.firebase.cloud.FirestoreClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Repository
public class ProdutoRepository {

    private static final String COLLECTION = "produtos";

    private Firestore getDB() {
        return FirestoreClient.getFirestore();
    }

    /**
     * Salvar novo produto.
     */
    public void save(ProdutoDTO produto) {
        try {
            getDB().collection(COLLECTION).document(produto.getId()).set(produto).get();
            log.debug("Produto salvo: {}", produto.getId());
        } catch (Exception e) {
            log.error("Erro ao salvar produto", e);
            throw new RuntimeException("Erro ao salvar produto", e);
        }
    }

    /**
     * Buscar produto por ID.
     */
    public Optional<ProdutoDTO> findById(String id) {
        try {
            var document = getDB().collection(COLLECTION).document(id).get().get();
            if (document.exists()) {
                return Optional.of(document.toObject(ProdutoDTO.class));
            }
            return Optional.empty();
        } catch (Exception e) {
            log.error("Erro ao buscar produto por ID: {}", id, e);
            throw new RuntimeException("Erro ao buscar produto", e);
        }
    }

    /**
     * Buscar produtos ativos com paginação e filtros.
     */
    public Page<ProdutoDTO> findAtivos(Pageable pageable, String categoria, String busca) {
        try {
            CollectionReference col = getDB().collection(COLLECTION);
            Query query = col.whereEqualTo("ativo", true);

            // Filtro por categoria
            if (categoria != null && !categoria.isBlank()) {
                query = query.whereEqualTo("categoria", categoria.toLowerCase().trim());
            }

            // Nota: Firestore tem limitações com busca de texto completo.
            // Para busca real, considerar usar Algolia ou Cloud Search.
            // Por enquanto, aplicamos filtro em memória
            QuerySnapshot snapshot = query.get().get();
            List<ProdutoDTO> produtos = snapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(ProdutoDTO.class))
                    .filter(p -> busca == null || busca.isBlank() || 
                            p.getNome().toLowerCase().contains(busca.toLowerCase()) ||
                            p.getDescricao().toLowerCase().contains(busca.toLowerCase()))
                    .collect(Collectors.toList());

            // Aplicar paginação em memória (não ideal, mas funciona para datasets pequenos)
            int start = (int) pageable.getOffset();
            int end = Math.min((start + pageable.getPageSize()), produtos.size());
            List<ProdutoDTO> page = produtos.subList(start, end);

            return new PageImpl<>(page, pageable, produtos.size());
        } catch (Exception e) {
            log.error("Erro ao buscar produtos ativos", e);
            throw new RuntimeException("Erro ao buscar produtos", e);
        }
    }

    /**
     * Buscar todos os produtos (sem filtros).
     */
    public List<ProdutoDTO> findAll() {
        try {
            QuerySnapshot snapshot = getDB().collection(COLLECTION).get().get();
            return snapshot.getDocuments().stream()
                    .map(doc -> doc.toObject(ProdutoDTO.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Erro ao listar todos os produtos", e);
            throw new RuntimeException("Erro ao listar produtos", e);
        }
    }

    /**
     * Atualizar produto.
     */
    public void update(String id, ProdutoDTO produto) {
        try {
            getDB().collection(COLLECTION).document(id).set(produto).get();
            log.debug("Produto atualizado: {}", id);
        } catch (Exception e) {
            log.error("Erro ao atualizar produto: {}", id, e);
            throw new RuntimeException("Erro ao atualizar produto", e);
        }
    }

    /**
     * Deletar produto por ID.
     */
    public void deleteById(String id) {
        try {
            getDB().collection(COLLECTION).document(id).delete().get();
            log.debug("Produto deletado: {}", id);
        } catch (Exception e) {
            log.error("Erro ao deletar produto: {}", id, e);
            throw new RuntimeException("Erro ao deletar produto", e);
        }
    }
}

