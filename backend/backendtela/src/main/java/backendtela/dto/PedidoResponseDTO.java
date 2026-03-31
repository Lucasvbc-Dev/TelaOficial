package backendtela.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PedidoResponseDTO {
    private String id;
    private String nomeCliente;
    private String emailCLiente;
    private String endereco;
    private String itens;
    private BigDecimal total;
    private String status;
    private LocalDateTime data;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getEmailCLiente() {
        return emailCLiente;
    }

    public void setEmailCLiente(String emailCLiente) {
        this.emailCLiente = emailCLiente;
    }

    public String getEndereco() {
        return endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public String getItens() {
        return itens;
    }

    public void setItens(String itens) {
        this.itens = itens;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getData() {
        return data;
    }

    public void setData(LocalDateTime data) {
        this.data = data;
    }
}
