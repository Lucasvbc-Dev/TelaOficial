import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { getWhatsAppUrl } from "@/components/ui/WhatsAppButton";
import { useCart } from "@/contexts/CartContext";
import { ShoppingBag } from "lucide-react";
import verao0 from "@/assets/verao0.jpeg";
import verao1 from "@/assets/verao1.jpeg";
import verao2 from "@/assets/verao2.jpeg";
import verao3 from "@/assets/verao3.jpeg";
import verao4 from "@/assets/verao4.jpeg";
import verao5 from "@/assets/verao5.jpeg";
import Basic0 from "@/assets/Basic0.jpeg";
import Basic1 from "@/assets/Basic1.jpeg";
import Basic2 from "@/assets/Basic2.jpeg";
import Basic3 from "@/assets/Basic3.jpeg";
import Basic4 from "@/assets/Basic4.jpeg";
import Basic5 from "@/assets/Basic5.jpeg";
import Basic6 from "@/assets/Basic6.jpeg";
import Basic8 from "@/assets/Basic8.jpeg";
import Icons0 from "@/assets/Icons0.jpeg";
import Icons1 from "@/assets/Icons1.jpeg";
import Icons2 from "@/assets/Icons2.jpeg";
import Icons3 from "@/assets/Icons3.jpeg";



const allProducts = [
  {
    id: 2,
    name: "Blusa Verão 1",
    price: "R$ 269,00",
    category: "verao",
    image: verao0,
    description: "Blusa Leve",
    isNew: true,
  },

  {
    id: 3,
    name: "Blusa Verão 2",
    price: "R$ 1,00",
    category: "verao",
    image: verao1,
    description: "Blusa Fresca",
    isNew: true,
  },
  {
    id: 4,
    name: "Blusa Verão 3",
    price: "R$ 209,00",
    category: "verao",
    image: verao2,
    description: "Blusa Leve",
  },
  {
    id: 5,
    name: "Blusa Verão 4",
    price: "R$ 229,00",
    category: "verao",
    image: verao3,
    description: "Blusa Leve",
  },
  {
    id: 6,
    name: "Blusa Verão 5",
    price: "R$ 239,00",
    originalPrice: "R$ 299,00",
    category: "verao",
    image: verao4,
    description: "Blusa Leve",
    isPromo: true,
  },
  {
    id: 7,
    name: "Blusa Verão 6",
    price: "R$ 249,00",
    category: "verao",
    image: verao5,
    description: "Blusa Leve",
  },
  {
    id: 8,
    name: "Blusa Icons 1",
    price: "R$ 269,00",
    category: "icons",
    image: Icons0,
    description: "Blusa Estampada",
    isNew: true,
  },
  {
    id: 9,
    name: "Blusa Icons 2",
    price: "R$ 279,00",
    category: "icons",
    image: Icons1,
    description: "Blusa Estampada",
  },
  {
    id: 10,
    name: "Blusa Icons 3",
    price: "R$ 289,00",
    category: "icons",
    image: Icons2,
    description: "Blusa Estampada",
  },
  {
    id: 11,
    name: "Blusa Icons 4",
    price: "R$ 299,00",
    category: "icons",
    image: Icons3,
    description: "Blusa Estampada",
  },
  {
    id: 12,
    name: "Basica 1",
    price: "R$ 199,00",
    originalPrice: "R$ 249,00",
    category: "basic",
    image: Basic0,
    description: "Blusa Básica",
    isPromo: true,
  },
  {
    id: 13,
    name: "Basica 2",
    price: "R$ 209,00",
    category: "basic",
    image: Basic1,
    description: "Blusa Básica",
  },
  {
    id: 14,
    name: "Basica 3",
    price: "R$ 219,00",
    category: "basic",
    image: Basic2,
    description: "Blusa Básica",
  },
  {
    id: 15,
    name: "Conjunto Basica ",
    price: "R$ 229,00",
    category: "basic",
    image: Basic3,
    description: "Blusa Básica",
  },
  {
    id: 16,
    name: "Basica 5",
    price: "R$ 239,00",
    category: "basic",
    image: Basic4,
    description: "Blusa Básica",
  },
  {
    id: 17,
    name: "Basica 6",
    price: "R$ 249,00",
    category: "basic",
    image: Basic5,
    description: "Blusa Básica",
  },
  {
    id: 18,
    name: "Basica 7",
    price: "R$ 259,00",
    originalPrice: "R$ 329,00",
    category: "basic",
    image: Basic6,
    description: "Blusa Básica",
    isPromo: true,
  },
  {
    id: 19,
    name: "Basica 8",
    price: "R$ 279,00",
    category: "basic",
    image: Basic8,
    description: "Blusa Básica",
  },
];

const categories = [
  { id: "todos", label: "Todos" },
  { id: "new-in", label: "New In" },
  { id: "verao", label: "Coleção Verão" },
  { id: "icons", label: "Coleção Icons" },
  { id: "basic", label: "Basic TELA" },
  { id: "promocoes", label: "Promoções" },
];

const Catalogo = () => {
  const [activeCategory, setActiveCategory] = useState("todos");
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const { addItem } = useCart();

  const filteredProducts =
    activeCategory === "todos"
      ? allProducts
      : activeCategory === "new-in"
      ? allProducts.filter((p) => p.isNew)
      : activeCategory === "promocoes"
      ? allProducts.filter((p) => p.isPromo)
      : allProducts.filter((p) => p.category === activeCategory);

  return (
    <Layout>
      {/* Hero */}
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
              Explore nossas coleções completas de blusas, criadas com os melhores
              tecidos e atenção aos detalhes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
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

      {/* Products Grid */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12"
          >
            {filteredProducts.map((product, index) => (
              <AnimatedSection key={product.id} delay={index * 0.1}>
                <motion.div
                  layout
                  className="group cursor-pointer"
                  onClick={() => setSelectedProduct(product.id)}
                >
                  <div className="image-reveal aspect-[3/4] bg-secondary mb-6 overflow-hidden relative">
                    {product.isNew && (
                      <span className="absolute top-3 left-3 z-10 font-body text-[10px] tracking-widest uppercase bg-foreground text-background px-3 py-1">
                        New
                      </span>
                    )}
                    {product.isPromo && (
                      <span className="absolute top-3 right-3 z-10 font-body text-[10px] tracking-widest uppercase bg-red-600 text-white px-3 py-1">
                        Promo
                      </span>
                    )}
                    <motion.img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.25, 0.30, 0.30, 0.30],
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-foreground/5 flex items-center justify-center"
                    >
                      <span className="font-body text-xs tracking-widest uppercase text-foreground bg-background/90 px-6 py-3">
                        Ver Detalhes
                      </span>
                    </motion.div>
                  </div>
                  <div className="text-center">
                    <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-2">
                      {product.description}
                    </p>
                    <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      {product.originalPrice && (
                        <span className="font-body text-sm text-muted-foreground line-through">
                          {product.originalPrice}
                        </span>
                      )}
                      <p className={`font-body text-sm ${product.isPromo ? 'text-red-600 font-semibold' : 'text-foreground'}`}>
                        {product.price}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatedSection>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Modal */}
      {selectedProduct && (
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
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square lg:aspect-auto">
              <img
                src={allProducts.find((p) => p.id === selectedProduct)?.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-8 lg:p-12 flex flex-col justify-center">
              <p className="font-body text-xs text-muted-foreground tracking-wider uppercase mb-4">
                {allProducts.find((p) => p.id === selectedProduct)?.description}
              </p>
              <h2 className="font-display text-3xl lg:text-4xl text-foreground mb-4">
                {allProducts.find((p) => p.id === selectedProduct)?.name}
              </h2>
              <p className="font-body text-xl text-foreground mb-8">
                {allProducts.find((p) => p.id === selectedProduct)?.price}
              </p>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const product = allProducts.find((p) => p.id === selectedProduct);
                  if (product) {
                    addItem({ id: product.id, name: product.name, price: product.price, image: product.image });
                    setSelectedProduct(null);
                  }
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
