import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "../ui/AnimatedSection";
import { supabaseStoreService, type Produto } from "@/services/supabaseStoreService";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value || 0);

const normalizeCategory = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const normalizeName = (value?: string | null) =>
  (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const TARGET_NEW_IN_NAMES = ["new in 1", "new in 4", "new in 6"];

const FeaturedProducts = () => {
  const [products, setProducts] = useState<Produto[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await supabaseStoreService.listarProdutos({ page: 0, size: 200 });
        const allNewInProducts = response.content
          .filter((produto) => {
            const categoria = normalizeCategory(produto.categoria);
            return categoria === "new in" || categoria === "newin" || categoria.includes("new in");
          });

        const selectedInOrder = TARGET_NEW_IN_NAMES
          .map((targetName) =>
            allNewInProducts.find((produto) => normalizeName(produto.nome) === targetName),
          )
          .filter((produto): produto is Produto => Boolean(produto));

        if (selectedInOrder.length < 3) {
          const usedIds = new Set(selectedInOrder.map((produto) => produto.id));
          const complemento = allNewInProducts
            .filter((produto) => !usedIds.has(produto.id))
            .slice(0, 3 - selectedInOrder.length);
          setProducts([...selectedInOrder, ...complemento]);
          return;
        }

        setProducts(selectedInOrder.slice(0, 3));
      } catch (error) {
        console.error("Erro ao carregar destaques:", error);
      }
    };

    void load();
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <AnimatedSection className="text-center mb-16">
          <h2 className="section-heading text-foreground mb-4">Destaques</h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Novidades da coleção New In
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.15}>
              <Link to="/catalogo" className="group block">
                <div className="image-reveal aspect-[3/4] bg-secondary mb-6 overflow-hidden">
                  <motion.img
                    src={product.imagemUrl}
                    alt={product.nome}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                    {product.nome}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {formatPrice(product.preco)}
                  </p>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection className="text-center mt-16" delay={0.4}>
          <Link
            to="/catalogo"
            className="inline-block group"
          >
            <span className="font-body text-sm tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-2 transition-all duration-300 group-hover:pb-3">
              Ver Catálogo Completo
            </span>
          </Link>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FeaturedProducts;
