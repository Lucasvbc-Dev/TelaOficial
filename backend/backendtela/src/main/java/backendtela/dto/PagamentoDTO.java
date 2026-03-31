package backendtela.dto;

import backendtela.enums.Metodo;
import backendtela.enums.Status;

import java.math.BigDecimal;

public class PagamentoDTO {

    private String pedidoId;
    private Metodo metodo;
    private Number valor;

    public PagamentoDTO(){}



    public String getPedidoId() {
        return pedidoId;
    }

    public void setPedidoId(String pedidoId) {
        this.pedidoId = pedidoId;
    }



    public Metodo getMetodo() {
        return metodo;
    }

    public void setMetodo(Metodo metodo) {
        this.metodo = metodo;
    }


    public Number getValor() {
        return valor;
    }

    public void setValor(Number valor) {
        this.valor = valor;
    }
}
