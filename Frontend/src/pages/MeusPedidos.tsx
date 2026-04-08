import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2, RefreshCw, ShoppingBag } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Button } from "@/components/ui/button";
import api from "@/services/api";

type ItemPedido = {
  quantidade: number;
  nome: string;
};

type Pedido = {
  id: string;
  status: string;
  total: number;
  createdAt?: string;
  itens: ItemPedido[];
};

const POLLING_INTERVAL_MS = 10000;

const MeusPedidos = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPedidos = useCallback(
    async (background = false) => {
      if (!usuario) {
        return;
      }

      try {
        if (background) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await api.get<Pedido[]>(`/pedidos/usuario/${usuario.id}`);
        setPedidos(Array.isArray(response.data) ? response.data : []);
        setErrorMessage(null);
        setLastUpdated(new Date());
      } catch {
        setErrorMessage("Não foi possível atualizar seus pedidos agora.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [usuario],
  );

  useEffect(() => {
    if (!usuario) {
      navigate("/auth");
      return;
    }

    void fetchPedidos();

    const pollingId = window.setInterval(() => {
      void fetchPedidos(true);
    }, POLLING_INTERVAL_MS);

    return () => {
      window.clearInterval(pollingId);
    };
  }, [usuario, navigate, fetchPedidos]);

  useEffect(() => {
    if (!usuario) {
      return;
    }

    const handleFocus = () => {
      void fetchPedidos(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void fetchPedidos(true);
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [usuario, fetchPedidos]);

  const statusMeta = useMemo(
    () => ({
      PAGO: { label: "Pago", classes: "bg-emerald-500/10 text-emerald-700 border border-emerald-500/30" },
      PENDENTE: { label: "Pendente", classes: "bg-amber-500/10 text-amber-700 border border-amber-500/30" },
      CANCELADO: { label: "Cancelado", classes: "bg-rose-500/10 text-rose-700 border border-rose-500/30" },
    }),
    [],
  );

  if (!usuario) {
    return null;
  }

  return (
    <Layout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="display-heading text-foreground mb-4">Meus Pedidos</h1>
            <p className="font-body text-muted-foreground">
              Acompanhe em tempo real o status dos seus pedidos e pagamentos.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
          <AnimatedSection>
            <div className="border border-border rounded-lg p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <p className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    Histórico
                  </p>
                  <p className="font-body text-sm text-muted-foreground">
                    {lastUpdated ? `Atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}` : "Sincronizando pedidos..."}
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void fetchPedidos(true)}
                  disabled={isRefreshing}
                  className="font-body text-xs tracking-widest uppercase gap-2"
                >
                  {isRefreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                  Atualizar
                </Button>
              </div>

              {isLoading ? (
                <div className="py-16 text-center">
                  <Loader2 className="mx-auto animate-spin text-muted-foreground" size={26} />
                  <p className="font-body text-sm text-muted-foreground mt-4">Carregando seus pedidos...</p>
                </div>
              ) : errorMessage ? (
                <div className="py-12 text-center border border-destructive/30 bg-destructive/5 rounded-md">
                  <p className="font-body text-sm text-destructive">{errorMessage}</p>
                </div>
              ) : pedidos.length === 0 ? (
                <div className="py-14 text-center border border-dashed border-border rounded-md">
                  <ShoppingBag className="mx-auto mb-4 text-muted-foreground" size={32} />
                  <p className="font-body text-foreground mb-2">Nenhum pedido encontrado.</p>
                  <p className="font-body text-sm text-muted-foreground">Quando você finalizar um pedido, ele aparecerá aqui.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos.map((pedido) => {
                    const fallback = { label: pedido.status, classes: "bg-muted text-foreground border border-border" };
                    const normalizedStatus = pedido.status?.toUpperCase() as keyof typeof statusMeta;
                    const status = statusMeta[normalizedStatus] || fallback;

                    return (
                      <div key={pedido.id} className="border border-border rounded-md p-5 lg:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <p className="font-body text-xs tracking-[0.25em] uppercase text-muted-foreground mb-2">
                              Pedido #{pedido.id}
                            </p>
                            <p className="font-display text-2xl text-foreground">
                              R$ {Number(pedido.total || 0).toFixed(2).replace(".", ",")}
                            </p>
                          </div>

                          <span className={`inline-flex items-center px-3 py-1 text-xs font-body tracking-widest uppercase rounded-full ${status.classes}`}>
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-5 pt-4 border-t border-border space-y-2">
                          {pedido.itens?.map((item, index) => (
                            <div key={`${pedido.id}-${index}`} className="flex items-center justify-between gap-3 text-sm">
                              <span className="font-body text-foreground">{item.nome}</span>
                              <span className="font-body text-muted-foreground">x{item.quantidade}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default MeusPedidos;