import { useState } from "react";
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

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
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

    if (paymentMethod === "pix" && totalPrice < 1) {
      toast({
        title: "Valor mínimo para PIX",
        description: "Para pagamento via PIX, o valor do pedido deve ser de pelo menos R$ 1,00.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const itensPayload = items.map((item) => ({
        produtoId: item.id,
        nome: item.name,
        preco: item.price,
        quantidade: item.quantity,
      }));

      const pedido = await supabaseStoreService.criarPedido({
        usuarioId: usuario.id,
        metodoPagamento: paymentMethod,
        itens: itensPayload,
      });

      if (paymentMethod === "pix") {
        try {
          const pixResponse = await pagamentoService.pagarComPix({
            pedidoId: pedido.id,
            valor: Number(totalPrice.toFixed(2)),
            metodo: "PIX",
            email: usuario.email,
          });

          const txData = pixResponse.point_of_interaction?.transaction_data;
          if (!txData?.qr_code && !txData?.qr_code_base64) {
            throw new Error("PIX criado sem QR Code. Tente novamente em instantes.");
          }

          setPixQrBase64(txData.qr_code_base64 || null);
          setPixCode(txData.qr_code || null);
          clearCart();
          return;
        } catch (pixError: any) {
          toast({
            title: "PIX direto indisponível",
            description: "Redirecionando para o Checkout Pro com PIX.",
          });

          try {
            const checkoutResponse = await pagamentoService.criarCheckoutPro({
              pedidoId: pedido.id,
              email: usuario.email,
              metodoPagamento: "pix",
              itens: itensPayload,
              backUrl: window.location.origin,
            });

            clearCart();

            if (checkoutResponse?.initPoint) {
              window.location.href = checkoutResponse.initPoint;
              return;
            }

            throw new Error("Falha ao iniciar Checkout Pro para PIX.");
          } catch {
            throw pixError;
          }
        }
      }

      const checkoutResponse = await pagamentoService.criarCheckoutPro({
        pedidoId: pedido.id,
        email: usuario.email,
        metodoPagamento: paymentMethod,
        itens: itensPayload,
        backUrl: window.location.origin,
      });

      clearCart();

      if (checkoutResponse?.initPoint) {
        window.location.href = checkoutResponse.initPoint;
        return;
      }

      setOrderPlaced(true);
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
              Seu pedido foi realizado com sucesso! Você receberá um e-mail com os detalhes.
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
              Escaneie o QR Code no app do banco para concluir o pagamento.
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
                      <p className="font-body text-sm text-muted-foreground">Qtd: {item.quantity}</p>
                    </div>
                    <p className="font-body text-sm text-foreground self-center">{formatPrice(item.price)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
                <span className="font-body text-sm tracking-wider uppercase text-muted-foreground">Total</span>
                <span className="font-display text-3xl text-foreground">{formatPrice(totalPrice)}</span>
              </div>
            </motion.div>

            {/* Payment */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <h2 className="font-display text-2xl tracking-wide text-foreground mb-6 pb-4 border-b border-border">
                Forma de Pagamento
              </h2>
              <div className="space-y-3">
                {[
                  { id: "credito" as const, label: "Cartão de Crédito", icon: CreditCard, desc: "Até 12x sem juros" },
                  { id: "debito" as const, label: "Cartão de Débito", icon: CreditCard, desc: "Pagamento à vista" },
                  { id: "pix" as const, label: "PIX", icon: QrCode, desc: "Pagamento via Mercado Pago" },
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

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 border border-border bg-secondary/30"
              >
                <div className="flex items-start gap-3">
                  <QrCode size={20} className="mt-0.5 text-foreground shrink-0" />
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">
                    Ao confirmar, você será redirecionado para o Mercado Pago para concluir o pagamento.
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
                    ? "Ir para PIX no Mercado Pago"
                    : paymentMethod
                      ? "Ir para cartão no Mercado Pago"
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
