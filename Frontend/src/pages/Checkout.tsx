import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { CreditCard, QrCode, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabaseStoreService } from "@/services/supabaseStoreService";
import { pagamentoService } from "@/services/pagamentoService";

type PaymentMethod = "credito" | "debito" | "pix" | null;

type CardFormState = {
  cardholderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  securityCode: string;
  cpf: string;
  installments: number;
};

const onlyDigits = (value: string) => value.replace(/\D/g, "");

const toMonth = (value: string) => onlyDigits(value).slice(0, 2);
const toYear = (value: string) => onlyDigits(value).slice(0, 2);

const mapMercadoPagoStatusToLocal = (status?: string): "PAGO" | "PENDENTE" | "CANCELADO" => {
  const normalized = (status || "").toLowerCase();
  if (normalized === "approved") {
    return "PAGO";
  }
  if (normalized === "cancelled" || normalized === "rejected" || normalized === "refunded") {
    return "CANCELADO";
  }
  return "PENDENTE";
};

const Checkout = () => {
  const { items, clearCart } = useCart();
  const { toast } = useToast();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pixQrBase64, setPixQrBase64] = useState<string | null>(null);
  const [pixCode, setPixCode] = useState<string | null>(null);
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardholderName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    securityCode: "",
    cpf: "",
    installments: 1,
  });
  const [currentPedidoId, setCurrentPedidoId] = useState<string | null>(null);
  const [pixPaymentId, setPixPaymentId] = useState<string | null>(null);
  const [endereco, setEndereco] = useState("");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [frete, setFrete] = useState(0);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalComFrete = totalPrice + frete;
  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  const handlePlaceOrder = async () => {
    if (!paymentMethod) {
      toast({ title: "Selecione uma forma de pagamento", variant: "destructive" });
      return;
    }

    if (!usuario) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar autenticado para finalizar o pedido.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    if (!endereco.trim() || !cep.trim() || !cidade.trim() || !estado.trim()) {
      toast({
        title: "Endereço incompleto",
        description: "Preencha endereço, CEP, cidade e estado para continuar.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "pix" && totalComFrete < 0.01) {
      toast({
        title: "Valor mínimo para PIX",
        description: "Para pagamento via PIX, o valor do pedido deve ser de pelo menos R$ 0,01.",
        variant: "destructive",
      });
      return;
    }

    if (paymentMethod === "credito" || paymentMethod === "debito") {
      const number = onlyDigits(cardForm.cardNumber);
      const cvv = onlyDigits(cardForm.securityCode);
      const cpf = onlyDigits(cardForm.cpf);
      const month = toMonth(cardForm.expiryMonth);
      const year = toYear(cardForm.expiryYear);

      if (!cardForm.cardholderName.trim() || number.length < 13 || cvv.length < 3 || cpf.length < 11 || month.length < 2 || year.length < 2) {
        toast({
          title: "Dados do cartão incompletos",
          description: "Preencha nome, número, validade, CVV e CPF para continuar.",
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setIsSubmitting(true);

      const itensPayload = items.map((item) => ({
        produtoId: item.id,
        nome: item.name,
        preco: item.price,
        quantidade: item.quantity,
        tamanhoProduto: item.size,
      }));

      const pedido = await supabaseStoreService.criarPedido({
        usuarioId: usuario.id,
        metodoPagamento: paymentMethod,
        itens: itensPayload,
        endereco,
        cep,
        cidade,
        estado,
        frete,
      });
      setCurrentPedidoId(pedido.id);

      if (paymentMethod === "pix") {
        const pixResponse = await pagamentoService.pagarComPix({
          pedidoId: pedido.id,
          valor: Number(totalComFrete.toFixed(2)),
          metodo: "PIX",
          email: usuario.email,
        });

        const txData = pixResponse.point_of_interaction?.transaction_data;
        if (!txData?.qr_code && !txData?.qr_code_base64) {
          throw new Error("PIX criado sem QR Code. Tente novamente em instantes.");
        }

        const pixStatusLocal = mapMercadoPagoStatusToLocal(pixResponse.status);
        await supabaseStoreService.atualizarStatusPedidoEPagamento({
          pedidoId: pedido.id,
          status: pixStatusLocal,
          transactionId: String(pixResponse.id),
        });

        setPixQrBase64(txData.qr_code_base64 || null);
        setPixCode(txData.qr_code || null);
        setPixPaymentId(String(pixResponse.id));
        clearCart();

        if (pixStatusLocal === "PAGO") {
          setOrderPlaced(true);
        }
        return;
      }

      const cardToken = await pagamentoService.criarTokenCartao({
        cardholderName: cardForm.cardholderName.trim(),
        cardNumber: onlyDigits(cardForm.cardNumber),
        cardExpirationMonth: toMonth(cardForm.expiryMonth),
        cardExpirationYear: toYear(cardForm.expiryYear),
        securityCode: onlyDigits(cardForm.securityCode),
        identificationType: "CPF",
        identificationNumber: onlyDigits(cardForm.cpf),
      });

      const cardPayment = await pagamentoService.pagarComCartao({
        pedidoId: pedido.id,
        valor: Number(totalComFrete.toFixed(2)),
        email: usuario.email,
        token: cardToken,
        installments: paymentMethod === "debito" ? 1 : cardForm.installments,
      });

      const cardStatusLocal = mapMercadoPagoStatusToLocal(cardPayment.status);
      await supabaseStoreService.atualizarStatusPedidoEPagamento({
        pedidoId: pedido.id,
        status: cardStatusLocal,
        transactionId: String(cardPayment.id),
      });

      clearCart();
      setOrderPlaced(cardStatusLocal === "PAGO");

      if (cardStatusLocal !== "PAGO") {
        toast({
          title: "Pagamento em análise",
          description: "Seu pedido foi criado e o pagamento está pendente. Você pode acompanhar em Meus Pedidos.",
        });
        navigate("/meus-pedidos");
      }
    } catch (error: any) {
      const errorMsg = error?.message || "Erro desconhecido";

      console.error("Erro ao criar pedido:", error);

      toast({
        title: "Erro ao finalizar pedido",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!pixPaymentId || !currentPedidoId || orderPlaced) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const response = await pagamentoService.consultarStatusPagamento(pixPaymentId);
        const statusLocal = mapMercadoPagoStatusToLocal(response.status);

        await supabaseStoreService.atualizarStatusPedidoEPagamento({
          pedidoId: currentPedidoId,
          status: statusLocal,
          transactionId: pixPaymentId,
        });

        if (statusLocal === "PAGO") {
          setOrderPlaced(true);
          setPixCode(null);
          setPixQrBase64(null);
          window.clearInterval(timer);
        }

        if (statusLocal === "CANCELADO") {
          window.clearInterval(timer);
        }
      } catch {
        // Mantém polling silencioso para tentar novamente.
      }
    }, 5000);

    return () => window.clearInterval(timer);
  }, [pixPaymentId, currentPedidoId, orderPlaced]);

  const handleCopiarPix = async () => {
    if (!pixCode) {
      return;
    }

    try {
      await navigator.clipboard.writeText(pixCode);
      toast({ title: "Codigo PIX copiado" });
    } catch {
      toast({
        title: "Nao foi possivel copiar",
        description: "Copie manualmente o codigo PIX exibido.",
        variant: "destructive",
      });
    }
  };

  if (orderPlaced) {
    return (
      <Layout>
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center max-w-md mx-auto px-6"
          >
            <CheckCircle size={64} className="mx-auto mb-6 text-foreground" />
            <h1 className="font-display text-4xl tracking-wide text-foreground mb-4">Pedido Confirmado</h1>
            <p className="font-body text-muted-foreground mb-8">
              Seu pedido foi realizado e o pagamento foi processado no próprio site com sucesso.
            </p>
            <a
              href="/"
              className="inline-block px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors"
            >
              Voltar ao Início
            </a>
          </motion.div>
        </section>
      </Layout>
    );
  }

  if (pixQrBase64 || pixCode) {
    return (
      <Layout>
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 min-h-[80vh] flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl w-full mx-auto px-6 text-center"
          >
            <h1 className="font-display text-4xl tracking-wide text-foreground mb-4">Pagamento PIX</h1>
            <p className="font-body text-muted-foreground mb-8">
              Escaneie o QR Code no app do banco para concluir o pagamento. Após aprovação, seu pedido será atualizado automaticamente.
            </p>

            {pixQrBase64 && (
              <div className="bg-white p-4 rounded-md inline-block mb-6">
                <img
                  src={`data:image/png;base64,${pixQrBase64}`}
                  alt="QR Code PIX"
                  className="w-64 h-64"
                />
              </div>
            )}

            {pixCode && (
              <div className="space-y-3">
                <p className="font-body text-sm text-muted-foreground">Ou copie o codigo PIX:</p>
                <textarea
                  value={pixCode}
                  readOnly
                  className="w-full h-32 p-3 border border-border bg-secondary/30 text-xs"
                />
                <button
                  onClick={handleCopiarPix}
                  className="px-6 py-3 bg-foreground text-background font-body text-xs tracking-wider uppercase"
                >
                  Copiar codigo PIX
                </button>
              </div>
            )}
          </motion.div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 min-h-[80vh] flex items-center justify-center">
          <div className="text-center px-6">
            <h1 className="font-display text-4xl tracking-wide text-foreground mb-4">Sacola Vazia</h1>
            <p className="font-body text-muted-foreground mb-8">Adicione produtos ao seu carrinho antes de finalizar.</p>
            <a
              href="/catalogo"
              className="inline-block px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors"
            >
              Ver Menu
            </a>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="display-heading text-foreground mb-12 text-center"
          >
            Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Order Summary */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <h2 className="font-display text-2xl tracking-wide text-foreground mb-6 pb-4 border-b border-border">
                Resumo do Pedido
              </h2>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-20 bg-secondary overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-display text-base text-foreground">{item.name}</h3>
                      <p className="font-body text-xs text-muted-foreground">Tamanho: {item.size}</p>
                      <p className="font-body text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-body text-sm text-foreground self-center">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-body text-sm tracking-wider uppercase text-muted-foreground">Subtotal</span>
                <span className="font-display text-2xl text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-body text-sm tracking-wider uppercase text-muted-foreground">Frete</span>
                <span className="font-display text-2xl text-foreground">{formatPrice(frete)}</span>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-body text-sm tracking-wider uppercase text-muted-foreground">Total</span>
                <span className="font-display text-3xl text-foreground">{formatPrice(totalComFrete)}</span>
              </div>
            </motion.div>

            {/* Delivery & Payment */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display text-2xl tracking-wide text-foreground mb-6 pb-4 border-b border-border">
                Endereço de Entrega
              </h2>
              <div className="space-y-3 mb-8">
                <input
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  placeholder="Rua, número e complemento"
                  className="w-full h-11 px-3 border border-border bg-background font-body text-sm"
                />
                <input
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
                  placeholder="CEP (00000-000)"
                  className="w-full h-11 px-3 border border-border bg-background font-body text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Cidade"
                    className="h-11 px-3 border border-border bg-background font-body text-sm"
                  />
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="h-11 px-3 border border-border bg-background font-body text-sm"
                  >
                    <option value="">UF</option>
                    <option value="SP">SP</option>
                    <option value="RJ">RJ</option>
                    <option value="MG">MG</option>
                    <option value="RS">RS</option>
                    <option value="BA">BA</option>
                    <option value="SC">SC</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="CE">CE</option>
                    <option value="PA">PA</option>
                    <option value="GO">GO</option>
                    <option value="PB">PB</option>
                    <option value="MA">MA</option>
                    <option value="ES">ES</option>
                    <option value="PI">PI</option>
                    <option value="RN">RN</option>
                    <option value="AL">AL</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="DF">DF</option>
                    <option value="AC">AC</option>
                    <option value="AM">AM</option>
                    <option value="AP">AP</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
                <input
                  value={frete}
                  onChange={(e) => setFrete(Number(e.target.value) || 0)}
                  placeholder="Frete (R$)"
                  inputMode="decimal"
                  className="w-full h-11 px-3 border border-border bg-background font-body text-sm"
                />
              </div>

              <h2 className="font-display text-2xl tracking-wide text-foreground mb-6 pb-4 border-b border-border">
                Forma de Pagamento
              </h2>
              <div className="space-y-3">
                {[
                  { id: "credito" as const, label: "Cartão de Crédito", icon: CreditCard, desc: "Até 12x sem juros" },
                  { id: "debito" as const, label: "Cartão de Débito", icon: CreditCard, desc: "Pagamento à vista" },
                  { id: "pix" as const, label: "PIX", icon: QrCode, desc: "QR Code gerado no próprio site" },
                ].map((method) => (
                  <motion.button
                    key={method.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all duration-300 text-left ${
                      paymentMethod === method.id
                        ? "border-foreground bg-secondary"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <method.icon size={24} className="text-foreground flex-shrink-0" />
                    <div>
                      <p className="font-body text-sm font-medium text-foreground">{method.label}</p>
                      <p className="font-body text-xs text-muted-foreground">{method.desc}</p>
                    </div>
                  </motion.button>
                ))}
              </div>

              {(paymentMethod === "credito" || paymentMethod === "debito") && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 space-y-3"
                >
                  <input
                    value={cardForm.cardholderName}
                    onChange={(event) => setCardForm((prev) => ({ ...prev, cardholderName: event.target.value }))}
                    placeholder="Nome impresso no cartão"
                    className="w-full h-11 px-3 border border-border bg-background font-body text-sm"
                  />
                  <input
                    value={cardForm.cardNumber}
                    onChange={(event) =>
                      setCardForm((prev) => ({
                        ...prev,
                        cardNumber: onlyDigits(event.target.value).slice(0, 16),
                      }))
                    }
                    placeholder="Número do cartão"
                    inputMode="numeric"
                    className="w-full h-11 px-3 border border-border bg-background font-body text-sm"
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      value={cardForm.expiryMonth}
                      onChange={(event) => setCardForm((prev) => ({ ...prev, expiryMonth: toMonth(event.target.value) }))}
                      placeholder="MM"
                      inputMode="numeric"
                      className="h-11 px-3 border border-border bg-background font-body text-sm"
                    />
                    <input
                      value={cardForm.expiryYear}
                      onChange={(event) => setCardForm((prev) => ({ ...prev, expiryYear: toYear(event.target.value) }))}
                      placeholder="AA"
                      inputMode="numeric"
                      className="h-11 px-3 border border-border bg-background font-body text-sm"
                    />
                    <input
                      value={cardForm.securityCode}
                      onChange={(event) =>
                        setCardForm((prev) => ({
                          ...prev,
                          securityCode: onlyDigits(event.target.value).slice(0, 4),
                        }))
                      }
                      placeholder="CVV"
                      inputMode="numeric"
                      className="h-11 px-3 border border-border bg-background font-body text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={cardForm.cpf}
                      onChange={(event) =>
                        setCardForm((prev) => ({
                          ...prev,
                          cpf: onlyDigits(event.target.value).slice(0, 11),
                        }))
                      }
                      placeholder="CPF do titular"
                      inputMode="numeric"
                      className="h-11 px-3 border border-border bg-background font-body text-sm"
                    />
                    <select
                      value={cardForm.installments}
                      onChange={(event) =>
                        setCardForm((prev) => ({ ...prev, installments: Number(event.target.value) }))
                      }
                      disabled={paymentMethod === "debito"}
                      className="h-11 px-3 border border-border bg-background font-body text-sm"
                    >
                      {Array.from({ length: 12 }, (_, index) => index + 1).map((parcelas) => (
                        <option key={parcelas} value={parcelas}>
                          {parcelas}x
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 border border-border bg-secondary/30"
              >
                <div className="flex items-start gap-3">
                  <QrCode size={20} className="mt-0.5 text-foreground shrink-0" />
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    O pagamento é concluído aqui no site. Para PIX, o QR Code é gerado imediatamente após confirmar.
                  </p>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
                className="w-full mt-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors"
              >
                {isSubmitting
                  ? "Processando..."
                  : paymentMethod === "pix"
                    ? "Gerar QR Code PIX"
                    : paymentMethod
                      ? "Pagar no site"
                      : "Confirmar Pedido"}
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Checkout;
