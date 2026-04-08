import api from './api';

export interface PagamentoPix {
  pedidoId: string;
  valor: number;
  metodo: 'PIX';
  email: string;
}

export interface PagamentoCartao {
  pedidoId: string;
  valor: number;
  email: string;
  token: string;
  installments: number;
}

export interface RespostaPagamento {
  id: number;
  status: string;
  point_of_interaction?: {
    transaction_data: {
      qr_code?: string;
      qr_code_base64?: string;
    };
  };
}

export interface CriarCheckoutProPayload {
  pedidoId: string;
  email: string;
  metodoPagamento: 'credito' | 'debito' | 'pix';
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

/**
 * Serviço de Pagamentos (MercadoPago)
 */
export const pagamentoService = {
  /**
   * Processar pagamento via PIX
   */
  pagarComPix: async (pagamento: PagamentoPix): Promise<RespostaPagamento> => {
    try {
      const response = await api.post('/pagamentos/pix', pagamento);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao processar pagamento PIX';
      throw new Error(message);
    }
  },

  /**
   * Processar pagamento via Cartão de Crédito
   */
  pagarComCartao: async (pagamento: PagamentoCartao): Promise<RespostaPagamento> => {
    try {
      const response = await api.post('/pagamentos/cartao', pagamento);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao processar pagamento com cartão';
      throw new Error(message);
    }
  },

  criarCheckoutPro: async (payload: CriarCheckoutProPayload): Promise<RespostaCheckoutPro> => {
    try {
      const response = await api.post('/pagamentos/checkout-pro', payload);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar checkout do Mercado Pago';
      throw new Error(message);
    }
  },
};
