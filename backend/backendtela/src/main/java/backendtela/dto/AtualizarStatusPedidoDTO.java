package backendtela.dto;

public class AtualizarStatusPedidoDTO {

    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    // Backward compatibility with previous typo in controller/service calls.
    public String getStaus() {
        return status;
    }

    public void setStaus(String staus) {
        this.status = staus;
    }
}
