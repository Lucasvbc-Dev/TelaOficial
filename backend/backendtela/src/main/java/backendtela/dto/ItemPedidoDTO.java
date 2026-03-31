package backendtela.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedidoDTO {

    @NotNull(message = "ID do produto é obrigatório")
    @JsonProperty("produtoId")
    private String produtoId;

    @NotBlank(message = "Nome do produto é obrigatório")
    @JsonProperty("nome")
    private String nome;

    @NotNull(message = "Preço é obrigatório")
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que 0")
    @JsonFormat(shape = JsonFormat.Shape.NUMBER_FLOAT)
    @JsonProperty("preco")
    private BigDecimal preco;

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade mínima é 1")
    @Max(value = 999, message = "Quantidade máxima é 999")
    @JsonProperty("quantidade")
    private Integer quantidade;
}

