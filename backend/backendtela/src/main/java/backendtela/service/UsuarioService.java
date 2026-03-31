package backendtela.service;

import backendtela.dto.LoginDTO;
import backendtela.dto.LoginResponseDTO;
import backendtela.dto.UsuarioDTO;
import backendtela.dto.UsuarioResponseDTO;
import backendtela.entidades.Usuarios;
import backendtela.repository.UsuarioRepository;
import backendtela.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Slf4j
@Service
public class UsuarioService {

    private final UsuarioRepository repository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository repository, PasswordEncoder encoder, JwtService jwtService) {
        this.repository = repository;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    /**
     * Registrar novo usuário (cadastro).
     */
    public void salvar(UsuarioDTO dto) {
        log.info("Tentando registrar novo usuário: {}", dto.getEmail());
        
        repository.findByEmail(dto.getEmail()).ifPresent(existing -> {
            log.warn("Email já cadastrado: {}", dto.getEmail());
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ja cadastrado");
        });

        String id = UUID.randomUUID().toString();

        Usuarios usuario = new Usuarios();
        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setSenhaHash(encoder.encode(dto.getSenha()));
        usuario.setTelefone(dto.getTelefone());
        usuario.setEndereco(dto.getEndereco());

        repository.save(id, usuario);
        log.info("Novo usuário registrado: {} ({})", usuario.getEmail(), id);
    }

    /**
     * Autenticar usuário e gerar JWT token.
     */
    public LoginResponseDTO login(LoginDTO dto) {
        log.debug("Tentando fazer login: {}", dto.getEmail());
        
        var doc = repository.findByEmail(dto.getEmail())
                .orElseThrow(() -> {
                    log.warn("Tentativa de login com email inexistente: {}", dto.getEmail());
                    return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
                });

        Usuarios usuario = doc.toObject(Usuarios.class);
        if (usuario == null || !encoder.matches(dto.getSenha(), usuario.getSenhaHash())) {
            log.warn("Falha na autenticação: email={}, senha inválida", dto.getEmail());
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ou senha invalidos");
        }

        String token = jwtService.generateToken(doc.getId(), usuario.getEmail());
        log.info("Login bem-sucedido: {}", usuario.getEmail());

        return new LoginResponseDTO(
                token,
                doc.getId(),
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getEndereco()
        );
    }

    /**
     * Atualizar perfil do usuário.
     */
    public UsuarioResponseDTO atualizar(String id, UsuarioDTO dto) {
        log.info("Atualizando perfil do usuário: {}", id);
        
        var snapshot = repository.findById(id)
                .orElseThrow(() -> {
                    log.error("Usuário não encontrado para atualização: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado");
                });

        Usuarios usuario = snapshot.toObject(Usuarios.class);
        if (usuario == null) {
            log.error("Erro ao desserializar usuário: {}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado");
        }

        usuario.setNome(dto.getNome());
        usuario.setEmail(dto.getEmail());
        usuario.setTelefone(dto.getTelefone());
        usuario.setEndereco(dto.getEndereco());

        repository.updateProfile(id, usuario);
        log.info("Perfil atualizado: {}", dto.getEmail());

        return new UsuarioResponseDTO(
                id,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getEndereco()
        );
    }

    /**
     * Buscar dados do usuário por ID.
     */
    public UsuarioResponseDTO buscarPorId(String id) {
        log.debug("Buscando usuário: {}", id);
        
        var snapshot = repository.findById(id)
                .orElseThrow(() -> {
                    log.warn("Usuário não encontrado: {}", id);
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado");
                });

        Usuarios usuario = snapshot.toObject(Usuarios.class);
        if (usuario == null) {
            log.error("Erro ao desserializar usuário: {}", id);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario nao encontrado");
        }

        return new UsuarioResponseDTO(
                id,
                usuario.getNome(),
                usuario.getEmail(),
                usuario.getTelefone(),
                usuario.getEndereco()
        );
    }
}