package backendtela.repository;

import backendtela.entidades.Pedidos;
import com.google.cloud.firestore.Firestore;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class PedidoRepository {

    private static final String COLLECTION = "pedidos";

    public Firestore getDB() {
        return FirestoreClient.getFirestore();
    }

    public String getCollection() {
        return COLLECTION;
    }


    public List<Pedidos> findAll() {
        try {
            var snapshots = getDB()
                    .collection(COLLECTION)
                    .get()
                    .get();

            List<Pedidos> pedidos = new ArrayList<>();

            snapshots.forEach(doc -> {
                Pedidos pedido = doc.toObject(Pedidos.class);
                pedido.setId(doc.getId()); // garante o ID
                pedidos.add(pedido);
            });

            return pedidos;


        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar pedidos", e);
        }
    }

    public List<Pedidos> findByUsuarioId(String usuarioId) {
        try {
            var snapshots = getDB()
                    .collection(COLLECTION)
                    .whereEqualTo("usuarioId", usuarioId)
                    .get()
                    .get();

            List<Pedidos> pedidos = new ArrayList<>();

            snapshots.forEach(doc -> {
                Pedidos pedido = doc.toObject(Pedidos.class);
                pedido.setId(doc.getId());
                pedidos.add(pedido);
            });

            return pedidos;

        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar pedidos do usuário", e);
        }
    }

    public Optional<Pedidos> findById(String pedidoId) {
        try {
            var doc = getDB()
                    .collection(COLLECTION)
                    .document(pedidoId)
                    .get()
                    .get();

            if (doc.exists()) {
                Pedidos pedido = doc.toObject(Pedidos.class);
                if (pedido != null) {
                    pedido.setId(doc.getId());
                }
                return Optional.ofNullable(pedido);
            }

            return Optional.empty();

        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar pedido por ID", e);
        }
    }

    public void save(Pedidos pedido) {
        getDB().collection(COLLECTION).document(pedido.getId()).set(pedido);
    }

    public void updateStatus(String pedidoId, String status) {
        getDB().collection(COLLECTION).document(pedidoId).update("status", status);
    }
}
