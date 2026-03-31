import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "../ui/AnimatedSection";
import aboutImage from "@/assets/CEOS.jpeg";

const AboutPreview = () => {
  return (
    <section className="py-24 lg:py-32 bg-secondary">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <AnimatedSection>
            <div className="image-reveal aspect-[3/4] overflow-hidden">
              <motion.img
                src={aboutImage}
                alt="TELA Store"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              />
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="max-w-lg">
              <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                Nossa História
              </span>
              <h2 className="section-heading text-foreground mb-6">
                Feito para
                <br />
                Mulheres Reais
              </h2>
              <p className="font-body text-muted-foreground leading-relaxed mb-8">
                A Tela nasce do encontro entre duas grandes amigas em uma viagem marcada por conversas profundas sobre trabalho, criação e futuro. Entre ideias compartilhadas e desejos em comum, surgiu a vontade de expandir caminhos e trazer a moda e o empreendedorismo para dentro da rotina de forma verdadeira.
              </p>
              <Link
                to="/sobre"
                className="inline-block group"
              >
                <span className="font-body text-sm tracking-[0.2em] uppercase text-foreground border-b border-foreground pb-2 transition-all duration-300 group-hover:pb-3">
                  Conhecer Nossa História
                </span>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
