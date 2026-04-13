import api from "./api";

export interface PagamentoPixPayload {
  pedidoId: string;
  valor: number;
  metodo: "PIX";
  email: string;
}

export interface RespostaPagamentoPix {
  id: number;
  status: string;
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
}

export interface CriarCheckoutProPayload {
  pedidoId: string;
  email: string;
  metodoPagamento: "credito" | "debito" | "pix";
  itens: Array<{
    produtoId: string;
    nome: string;
    preco: number;
    quantidade: number;
  }>;
  backUrl?: string;
}

export interface RespostaCheckoutPro {
  preferenceId: string;
  initPoint: string;
  sandboxInitPoint?: string;
}

export const pagamentoService = {
  pagarComPix: async (
    payload: PagamentoPixPayload,
  ): Promise<RespostaPagamentoPix> => {
    try {
      const response = await api.post("/pagamentos/pix", payload);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Erro ao processar pagamento PIX";
      throw new Error(message);
    }
  },

  criarCheckoutPro: async (
    payload: CriarCheckoutProPayload,
  ): Promise<RespostaCheckoutPro> => {
    try {
      const response = await api.post("/pagamentos/checkout-pro", payload);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao criar checkout do Mercado Pago";
      throw new Error(message);
    }
  },
};
