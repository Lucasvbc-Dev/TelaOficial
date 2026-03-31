package backendtela.dto;

import backendtela.enums.Metodo;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarPagamentoDTO {

    @NotBlank(message = "ID do pedido é obrigatório")
    private String pedidoId;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor mínimo é R$ 0.01")
    private BigDecimal valor;

    @NotNull(message = "Método de pagamento é obrigatório")
    private Metodo metodo;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
}

