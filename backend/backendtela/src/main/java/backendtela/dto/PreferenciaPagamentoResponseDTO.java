package backendtela.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PreferenciaPagamentoResponseDTO {
    private String preferenceId;
    private String initPoint;
    private String sandboxInitPoint;
}