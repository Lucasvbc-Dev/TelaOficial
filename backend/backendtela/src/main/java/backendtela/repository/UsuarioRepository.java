package backendtela.repository;

import backendtela.entidades.Usuarios;
import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import com.google.firebase.cloud.FirestoreClient;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class UsuarioRepository {

    private static final String COLLECTION = "usuarios";

    private Firestore getDB() {
        return FirestoreClient.getFirestore();
    }

    public void save(String id, Usuarios usuario) {
        getDB().collection(COLLECTION).document(id).set(usuario);
    }

    public Optional<QueryDocumentSnapshot> findByEmail(String email) {
        try {
            var query = getDB().collection(COLLECTION)
                    .whereEqualTo("email", email)
                    .limit(1)
                    .get()
                    .get();

            if (query.isEmpty()) {
                return Optional.empty();
            }

            return Optional.of(query.getDocuments().get(0));
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar usuario por email", e);
        }
    }

    public Optional<DocumentSnapshot> findById(String id) {
        try {
            DocumentSnapshot snapshot = getDB().collection(COLLECTION).document(id).get().get();
            return snapshot.exists() ? Optional.of(snapshot) : Optional.empty();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao buscar usuario por id", e);
        }
    }

    public void updateProfile(String id, Usuarios usuario) {
        getDB().collection(COLLECTION).document(id).update(
                "nome", usuario.getNome(),
                "email", usuario.getEmail(),
                "telefone", usuario.getTelefone(),
                "endereco", usuario.getEndereco()
        );
    }
}
