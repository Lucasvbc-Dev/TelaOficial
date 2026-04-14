package backendtela.dto;

import java.math.BigDecimal;

import backendtela.enums.Metodo;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarPagamentoDTO {

    @NotBlank(message = "ID do pedido é obrigatório")
    private String pedidoId;

    @NotNull(message = "Valor é obrigatório")
    @DecimalMin(value = "0.01", message = "Valor mínimo para PIX é R$ 0.01")
    private BigDecimal valor;

    @NotNull(message = "Método de pagamento é obrigatório")
    private Metodo metodo;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;
}

