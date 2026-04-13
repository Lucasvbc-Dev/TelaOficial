import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import { supabaseStoreService, type Produto } from "@/services/supabaseStoreService";

type Category = { id: string; label: string };

const normalizeCategory = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const FIXED_CATEGORIES: Category[] = [
  { id: "todas", label: "Todas" },
  { id: "new-in", label: "New In" },
  { id: "colecao-verao", label: "Coleção Verão" },
  { id: "colecao-icons", label: "Coleção Icons" },
  { id: "basic-tela", label: "Basic Tela" },
];

type CollectionKey = "basic-tela" | "colecao-icons" | "colecao-verao" | "new-in" | "todas";

const getCollectionKey = (categoria?: string | null): CollectionKey => {
  const normalized = normalizeCategory(categoria);

  if (
    normalized === "basic tela" ||
    normalized === "basic_tela" ||
    (normalized.includes("basic") && normalized.includes("tela"))
  ) {
    return "basic-tela";
  }

  if (
    normalized === "colecao icons" ||
    normalized === "icons" ||
    normalized.includes("icon")
  ) {
    return "colecao-icons";
  }

  if (
    normalized === "colecao verao" ||
    normalized === "verao" ||
    normalized.includes("verao")
  ) {
    return "colecao-verao";
  }

  if (
    normalized === "new in" ||
    normalized === "newin" ||
    (normalized.includes("new") && normalized.includes("in"))
  ) {
    return "new-in";
  }

  return "todas";
};

const Catalogo = () => {
  const [activeCategory, setActiveCategory] = useState("basic-tela");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [products, setProducts] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await supabaseStoreService.listarProdutos({ page: 0, size: 200 });
        setProducts(response.content);
      } catch (error) {
        console.error("Erro ao carregar catálogo:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const categories: Category[] = useMemo(() => FIXED_CATEGORIES, []);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => getCollectionKey(product.categoria) === activeCategory);
  }, [activeCategory, products]);

  const selected = products.find((product) => product.id === selectedProduct) || null;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

  return (
    <Layout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="display-heading text-foreground mb-6">Menu</h1>
            <p className="font-body text-lg text-muted-foreground">
              Confira o catálogo da nossa Loja
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-y border-border">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-wrap justify-center gap-4 lg:gap-8">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`font-body text-sm tracking-widest uppercase transition-all duration-300 pb-1 ${
                  activeCategory === category.id
                    ? "text-foreground border-b border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {category.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="text-center py-20 font-body text-muted-foreground">Carregando produtos...</div>
          ) : (
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
              {filteredProducts.map((product, index) => (
                <AnimatedSection key={product.id} delay={index * 0.05}>
                  <motion.div
                    layout
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product.id)}
                  >
                    <div className="image-reveal aspect-[3/4] bg-secondary mb-6 overflow-hidden relative">
                      <motion.img
                        src={product.imagemUrl}
                        alt={product.nome}
                        className="w-full h-full object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3, ease: [0.25, 0.3, 0.3, 0.3] }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-2">
                        {product.categoria}
                      </p>
                      <h3 className="font-display text-xl tracking-wide text-foreground mb-2">{product.nome}</h3>
                      <p className="font-body text-sm text-foreground">{formatPrice(product.preco)}</p>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </motion.div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-20 font-body text-muted-foreground">
              Nenhum produto encontrado nesta aba.
            </div>
          )}
        </div>
      </section>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-background max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 border border-border"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="aspect-square lg:aspect-auto">
              <img src={selected.imagemUrl} alt={selected.nome} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-4">
                {selected.categoria}
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">{selected.nome}</h2>
              <p className="font-body text-base text-muted-foreground mb-6">{selected.descricao}</p>
              <p className="font-body text-xl text-foreground mb-8">{formatPrice(selected.preco)}</p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  addItem({
                    id: selected.id,
                    name: selected.nome,
                    price: selected.preco,
                    image: selected.imagemUrl,
                  });
                  setSelectedProduct(null);
                }}
                className="px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors duration-300 text-center flex items-center justify-center gap-2"
              >
                <ShoppingBag size={16} />
                Adicionar à Sacola
              </motion.button>
              <button
                onClick={() => setSelectedProduct(null)}
                className="mt-4 font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </Layout>
  );
};

export default Catalogo;
