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

export interface PagamentoCartaoPayload {
  pedidoId: string;
  valor: number;
  email: string;
  token: string;
  installments: number;
}

export interface RespostaPagamentoCartao {
  id: number;
  status: string;
}

export interface RespostaStatusPagamento {
  paymentId: string;
  status: string;
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

type CreateCardTokenInput = {
  cardNumber: string;
  cardholderName: string;
  cardExpirationMonth: string;
  cardExpirationYear: string;
  securityCode: string;
  identificationType?: string;
  identificationNumber?: string;
};

type MercadoPagoTokenResponse = {
  id: string;
};

const MERCADO_PAGO_PUBLIC_KEY =
  import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY ||
  "APP_USR-35e7ec45-92bd-44ec-96d8-75761abc4be9";

const MERCADO_PAGO_SCRIPT = "https://sdk.mercadopago.com/js/v2";

let mercadoPagoScriptPromise: Promise<void> | null = null;

const ensureMercadoPagoSdkLoaded = async () => {
  if ((window as any).MercadoPago) {
    return;
  }

  if (!mercadoPagoScriptPromise) {
    mercadoPagoScriptPromise = new Promise<void>((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src=\"${MERCADO_PAGO_SCRIPT}\"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener("error", () => reject(new Error("Falha ao carregar SDK do Mercado Pago.")), {
          once: true,
        });
        return;
      }

      const script = document.createElement("script");
      script.src = MERCADO_PAGO_SCRIPT;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Falha ao carregar SDK do Mercado Pago."));
      document.head.appendChild(script);
    });
  }

  await mercadoPagoScriptPromise;
};

const createCardToken = async (input: CreateCardTokenInput): Promise<string> => {
  if (!MERCADO_PAGO_PUBLIC_KEY) {
    throw new Error("Public key do Mercado Pago não configurada no frontend.");
  }

  await ensureMercadoPagoSdkLoaded();

  const MercadoPago = (window as any).MercadoPago;
  if (!MercadoPago) {
    throw new Error("SDK do Mercado Pago indisponível.");
  }

  const mp = new MercadoPago(MERCADO_PAGO_PUBLIC_KEY, { locale: "pt-BR" });
  const tokenResponse = (await mp.createCardToken({
    cardNumber: input.cardNumber,
    cardholderName: input.cardholderName,
    cardExpirationMonth: input.cardExpirationMonth,
    cardExpirationYear: input.cardExpirationYear,
    securityCode: input.securityCode,
    identificationType: input.identificationType,
    identificationNumber: input.identificationNumber,
  })) as MercadoPagoTokenResponse;

  if (!tokenResponse?.id) {
    throw new Error("Não foi possível gerar token do cartão.");
  }

  return tokenResponse.id;
};

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

  pagarComCartao: async (
    payload: PagamentoCartaoPayload,
  ): Promise<RespostaPagamentoCartao> => {
    try {
      const response = await api.post("/pagamentos/cartao", payload);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao processar pagamento com cartão";
      throw new Error(message);
    }
  },

  criarTokenCartao: createCardToken,

  consultarStatusPagamento: async (
    paymentId: string,
  ): Promise<RespostaStatusPagamento> => {
    try {
      const response = await api.get(`/pagamentos/${paymentId}/status`);
      return response.data;
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Erro ao consultar status do pagamento";
      throw new Error(message);
    }
  },
};
