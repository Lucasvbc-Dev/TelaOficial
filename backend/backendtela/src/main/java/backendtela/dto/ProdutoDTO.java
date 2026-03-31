package backendtela.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProdutoDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String id;

    @NotBlank(message = "Nome do produto é obrigatório")
    @Size(min = 3, max = 100, message = "Nome deve ter entre 3 e 100 caracteres")
    private String nome;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço mínimo é R$ 0.01")
    @DecimalMax(value = "999999.99", message = "Preço máximo é R$ 999999.99")
    private BigDecimal preco;

    @NotBlank(message = "Descrição é obrigatória")
    @Size(min = 10, max = 500, message = "Descrição deve ter entre 10 e 500 caracteres")
    private String descricao;

    @NotBlank(message = "Categoria é obrigatória")
    private String categoria;

    @Pattern(regexp = "^https?://.*\\.(jpg|jpeg|png|gif|webp)$", message = "URL de imagem inválida")
    private String imagemUrl;

    @NotNull(message = "Status de ativação é obrigatório")
    private Boolean ativo;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedAt;
}
