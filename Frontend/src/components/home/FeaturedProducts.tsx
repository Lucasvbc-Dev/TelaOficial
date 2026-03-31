import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "../ui/AnimatedSection";

import verao3 from "@/assets/verao3.jpeg";
import verao4 from "@/assets/verao4.jpeg";
import verao5 from "@/assets/verao5.jpeg";

const products = [
  {
    id: 1,
    name: "Blusa Verão 3",
    price: "R$ 289,00",
    image: verao3,
  },
  {
    id: 2,
    name: "Blusa Verão 4",
    price: "R$ 299,00",
    image: verao4,
  },
  {
    id: 3,
    name: "Blusa Verão 5",
    price: "R$ 259,00",
    image: verao5,
  },
];

const FeaturedProducts = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <AnimatedSection className="text-center mb-16">
          <h2 className="section-heading text-foreground mb-4">Destaques</h2>
          <p className="font-body text-muted-foreground max-w-lg mx-auto">
            Peças da nova Coleção de Verão
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {products.map((product, index) => (
            <AnimatedSection key={product.id} delay={index * 0.15}>
              <Link to="/catalogo" className="group block">
                <div className="image-reveal aspect-[3/4] bg-secondary mb-6 overflow-hidden">
                  <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-display text-xl tracking-wide text-foreground mb-2">
                    {product.name}
                  </h3>
                  <p className="font-body text-sm text-muted-foreground">
                    {product.price}
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
