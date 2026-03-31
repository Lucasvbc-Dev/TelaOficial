package backendtela.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true", matchIfMissing = true)
public class FirebaseConfig {

    @Value("${firebase.credentials-path:firebase-service-account.json}")
    private String credentialsPath;

    @Value("${firebase.project-id:}")
    private String projectId;

    @PostConstruct
    public void init() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }

        try (InputStream serviceAccount = openCredentials(credentialsPath)) {
            if (serviceAccount == null) {
                throw new RuntimeException("Arquivo de credenciais Firebase nao encontrado: " + credentialsPath);
            }

            FirebaseOptions.Builder builder = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount));

            if (projectId != null && !projectId.isBlank()) {
                builder.setProjectId(projectId.trim());
            }

            FirebaseApp.initializeApp(builder.build());
        } catch (Exception e) {
            throw new RuntimeException("Erro ao inicializar Firebase", e);
        }
    }

    private InputStream openCredentials(String rawPath) throws IOException {
        String pathValue = rawPath == null ? "" : rawPath.trim();

        if (pathValue.isEmpty()) {
            return getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
        }

        if (pathValue.startsWith("classpath:")) {
            String classpathResource = pathValue.substring("classpath:".length());
            return getClass().getClassLoader().getResourceAsStream(classpathResource);
        }

        Path filePath = Paths.get(pathValue);
        if (Files.exists(filePath)) {
            return Files.newInputStream(filePath);
        }

        return getClass().getClassLoader().getResourceAsStream(pathValue);
    }
}