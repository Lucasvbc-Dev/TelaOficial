import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import aboutImage from "@/assets/Cris.jpeg";
import heroImage from "@/assets/Nadir.jpeg";

const Sobre = () => {
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
            <h1 className="display-heading text-foreground mb-6">
              Nossa História
            </h1>
            <p className="font-body text-lg text-muted-foreground">
              Conheça a jornada por trás de cada peça que criamos
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story Section 1 */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimatedSection>
              <div className="image-reveal aspect-[4/5] overflow-hidden">
                <motion.img
                  src={aboutImage}
                  alt="TELA Atelier"
                  className="w-full h-full object-cover"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div>
                <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                  O Início
                </span>
                <h2 className="section-heading text-foreground mb-6">
                  Da Paixão
                  <br />
                  ao Propósito
                </h2>
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                   Uma marca autoral construída a partir de escolhas conscientes e de um olhar atento à moda, aos detalhes e à permanência. Com foco em t-shirts próprias, a Tela nasce como expressão de um vestir com intenção, onde cada peça é pensada para atravessar o tempo, comunicar identidade e fugir do excesso. Aqui, menos não é ausência, é posicionamento.
                  </p>
                  <p>
                    A Tela acredita em uma moda que acompanha, sustenta e representa quem veste.
                    Menos excesso,
                    Mais essência.
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-24 lg:py-32 bg-secondary">
        <div className="container mx-auto px-6 lg:px-12">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-heading text-foreground mb-4">
              Nossos Valores
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {[
              {
                title: "Qualidade",
                description:
                  "Selecionamos apenas os melhores tecidos naturais: algodão egípcio, seda italiana e linho europeu. Cada peça passa por rigoroso controle de qualidade.",
              },
              {
                title: "Atemporalidade",
                description:
                  "Criamos designs que transcendem modismos. Nossas blusas são investimentos em elegância que você usará por anos.",
              },
              {
                title: "Sustentabilidade",
                description:
                  "Produção consciente, embalagens recicláveis e parcerias com fornecedores éticos. Moda que respeita pessoas e planeta.",
              },
            ].map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 0.15}>
                <div className="text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-16 h-16 mx-auto mb-6 border border-foreground flex items-center justify-center"
                  >
                    <span className="font-display text-2xl text-foreground">
                      {index + 1}
                    </span>
                  </motion.div>
                  <h3 className="font-display text-2xl text-foreground mb-4">
                    {value.title}
                  </h3>
                  <p className="font-body text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section 2 */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <AnimatedSection delay={0.2} className="order-2 lg:order-1">
              <div>
                <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4 block">
                  O Futuro
                </span>
                <h2 className="section-heading text-foreground mb-6">
                  Celebrando
                  <br />a Mulher Real
                </h2>
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                    Acreditamos que toda mulher merece se sentir confiante e
                    elegante. Por isso, criamos blusas que se adaptam a
                    diferentes corpos e estilos de vida.
                  </p>
                  <p>
                    Do escritório ao fim de semana, do casual ao sofisticado —
                    nossas peças são versáteis o suficiente para acompanhar
                    todas as facetas da vida moderna.
                  </p>
                  <p>
                  </p>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection className="order-1 lg:order-2">
              <div className="image-reveal aspect-[4/5] overflow-hidden">
                <motion.img
                  src={heroImage}
                  alt="TELA Fashion"
                  className="w-full h-full object-cover object-top"
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.8 }}
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-24 lg:py-32 bg-foreground text-primary-foreground">
        <div className="container mx-auto px-6 lg:px-12">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <blockquote className="font-display text-3xl lg:text-4xl font-light leading-relaxed mb-8 italic">
              "A verdadeira elegância não está em seguir tendências, mas em
              conhecer a si mesma e vestir-se com confiança."
            </blockquote>
            <p className="font-body text-sm tracking-widest uppercase text-primary-foreground/60">
              — Nadir e Cris Pinto.
            </p>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default Sobre;
