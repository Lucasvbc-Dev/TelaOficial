package backendtela.repository;

import backendtela.entidades.Pagamentos;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class PagamentoRepository {

    private static final String COLLECTION = "pagamentos";

    private Firestore getDB() {
        return FirestoreClient.getFirestore();
    }

    public void save(Pagamentos pagamento) {
        getDB().collection(COLLECTION).document(pagamento.getIdPagamento()).set(pagamento);
    }

    public Optional<Pagamentos> findByTransactionId(String transactionId) {
        try {
            var query = getDB().collection(COLLECTION)
                    .whereEqualTo("transactionId", transactionId)
                    .limit(1)
                    .get()
                    .get();

            if (query.isEmpty()) {
                return Optional.empty();
            }

            return Optional.ofNullable(query.getDocuments().get(0).toObject(Pagamentos.class));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar pagamento por transactionId", e);
        }
    }

    public Optional<Pagamentos> findByPedidoId(String pedidoId) {
        try {
            var query = getDB().collection(COLLECTION)
                    .whereEqualTo("pedidoId", pedidoId)
                    .limit(1)
                    .get()
                    .get();

            if (query.isEmpty()) {
                return Optional.empty();
            }

            return Optional.ofNullable(query.getDocuments().get(0).toObject(Pagamentos.class));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar pagamento por pedidoId", e);
        }
    }

    public void updateStatusAndTransaction(String idPagamento, String transactionId, String status) {
        getDB().collection(COLLECTION).document(idPagamento).update(
                "transactionId", transactionId,
                "status", status
        );
    }
}
