package backendtela.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CriarPreferenciaPagamentoDTO {

    @NotBlank(message = "ID do pedido é obrigatório")
    private String pedidoId;

    @NotBlank(message = "Email é obrigatório")
    @Email(message = "Email inválido")
    private String email;

    @NotEmpty(message = "Pelo menos um item é obrigatório")
    @Valid
    private List<ItemPedidoDTO> itens;

    @NotBlank(message = "Método de pagamento é obrigatório")
    private String metodoPagamento;

    private String backUrl;
}