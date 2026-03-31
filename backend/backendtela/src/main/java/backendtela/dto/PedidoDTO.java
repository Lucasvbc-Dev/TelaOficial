package backendtela.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoDTO {

    @NotNull(message = "ID do usuário é obrigatório")
    @JsonProperty("usuarioId")
    private String usuarioId;

    @NotEmpty(message = "Pelo menos um item é obrigatório no pedido")
    @Valid
    @JsonProperty("itens")
    private List<ItemPedidoDTO> itens;
}
