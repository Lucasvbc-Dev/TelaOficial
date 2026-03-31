package backendtela.config;

import com.mercadopago.MercadoPagoConfig;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
public class MercadoPagoConfigApp {

    @Value("${mercadopago.access-token:}")
    private String accessToken;

    @Value("${mercadopago.public-key:}")
    private String publicKey;

    @PostConstruct
    public void init() {
        if (accessToken != null && !accessToken.isBlank()) {
            MercadoPagoConfig.setAccessToken(accessToken.trim());
            log.info("MercadoPago configurado com token de acesso");
        } else {
            log.warn("⚠️  MercadoPago: Token de acesso não configurado. Endpoints de pagamento não funcionarão.");
        }

        if (publicKey != null && !publicKey.isBlank()) {
            log.info("MercadoPago: Public key configurada para cliente");
        }
    }

    public String getAccessToken() {
        return accessToken;
    }

    public String getPublicKey() {
        return publicKey;
    }
}

