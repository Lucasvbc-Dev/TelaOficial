package backendtela.controller;

import backendtela.dto.LoginDTO;
import backendtela.dto.LoginResponseDTO;
import backendtela.dto.UsuarioDTO;
import backendtela.dto.UsuarioResponseDTO;
import backendtela.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/usuarios")
@CrossOrigin
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    // CADASTRO
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void criar(@RequestBody UsuarioDTO dto) {
        service.salvar(dto);
    }

    @PutMapping("/{id}")
    public UsuarioResponseDTO atualizar(
            @PathVariable String id,
            @RequestBody UsuarioDTO dto,
            Authentication authentication
    ) {
        validarAcessoDoProprioUsuarioOuAdmin(authentication, id);
        return service.atualizar(id, dto);
    }

    // LOGIN
    @PostMapping("/login")
    public LoginResponseDTO login(@RequestBody LoginDTO dto) {
        return service.login(dto);
    }

    @GetMapping("/me")
    public UsuarioResponseDTO me(Authentication authentication) {
        return service.buscarPorId(authentication.getName());
    }

    private void validarAcessoDoProprioUsuarioOuAdmin(Authentication authentication, String usuarioId) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Nao autenticado");
        }

        boolean admin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        if (!admin && !usuarioId.equals(authentication.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissao para atualizar este usuario");
        }
    }
}
