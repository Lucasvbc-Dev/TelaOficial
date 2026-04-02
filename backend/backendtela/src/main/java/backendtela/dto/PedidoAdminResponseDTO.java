package backendtela.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class PedidoAdminResponseDTO {

    private String pedidoId;
    private String nomeCliente;
    private String emailCliente;
    private String enderecoEntrega;
    private List<ItemPedidoDTO> itens;
    private BigDecimal total;
    private String status;
    private LocalDateTime createdAt;


    public PedidoAdminResponseDTO(String pedidoId, String nomeCliente, String emailCliente, String enderecoEntrega, List<ItemPedidoDTO> itens, BigDecimal total, String status, LocalDateTime createdAt) {
        this.pedidoId = pedidoId;
        this.nomeCliente = nomeCliente;
        this.emailCliente = emailCliente;
        this.enderecoEntrega = enderecoEntrega;
        this.itens = itens;
        this.total = total;
        this.status = status;
    }

    public String getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(String pedidoId) {
        this.pedidoId = pedidoId;
    }

    public String getNomeCliente() {
        return nomeCliente;
    }

    public void setNomeCliente(String nomeCliente) {
        this.nomeCliente = nomeCliente;
    }

    public String getEmailCliente() {
        return emailCliente;
    }

    public void setEmailCliente(String emailCliente) {
        this.emailCliente = emailCliente;
    }

    public String getEnderecoEntrega() {
        return enderecoEntrega;
    }

    public void setEnderecoEntrega(String enderecoEntrega) {
        this.enderecoEntrega = enderecoEntrega;
    }

    public List<ItemPedidoDTO> getItens() {
        return itens;
    }

    public void setItens(List<ItemPedidoDTO> itens) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
