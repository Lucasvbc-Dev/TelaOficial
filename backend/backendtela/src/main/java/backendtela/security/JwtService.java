package backendtela.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class JwtService {

    @Value("${auth.jwt.secret}")
    private String jwtSecret;

    @Value("${auth.jwt.expiration-minutes:1440}")
    private long expirationMinutes;

    @Value("${auth.admin-emails:}")
    private String adminEmails;

    public String generateToken(String userId, String email) {
        Instant now = Instant.now();
        List<String> roles = resolveRoles(email);

        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .claim("roles", roles)
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plus(expirationMinutes, ChronoUnit.MINUTES)))
                .signWith(signingKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractUserId(String token) {
        return parseClaims(token).getSubject();
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Object roles = parseClaims(token).get("roles");
        if (roles instanceof List<?> list) {
            return list.stream().map(String::valueOf).collect(Collectors.toList());
        }
        return List.of("USER");
    }

    public boolean isTokenValid(String token) {
        try {
            Claims claims = parseClaims(token);
            Date expiration = claims.getExpiration();
            return expiration != null && expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    private List<String> resolveRoles(String email) {
        List<String> roles = new ArrayList<>();
        roles.add("USER");

        if (email == null || adminEmails == null || adminEmails.isBlank()) {
            return roles;
        }

        boolean isAdmin = Arrays.stream(adminEmails.split(","))
                .map(String::trim)
                .filter(s -> !s.isBlank())
                .anyMatch(adminEmail -> adminEmail.equalsIgnoreCase(email));

        if (isAdmin) {
            roles.add("ADMIN");
        }

        return roles;
    }
}
