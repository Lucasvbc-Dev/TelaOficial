package backendtela.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagamentoCartaoDTO {

    @NotBlank(message = "ID do pedido é obrigatório")
    private String pedidoId;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor mínimo é R$ 0.01")
    private BigDecimal valor;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotBlank(message = "Token do cartão é obrigatório")
    private String token;

    @NotNull(message = "Número de parcelas é obrigatório")
    @Min(value = 1, message = "Mínimo 1 parcela")
    @Max(value = 12, message = "Máximo 12 parcelas")
    private Integer installments;
}
