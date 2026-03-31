import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedSection from "../ui/AnimatedSection";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-6 lg:px-12">
        <AnimatedSection className="max-w-2xl mx-auto text-center">
          <h2 className="section-heading text-foreground mb-4">
            Fique por Dentro
          </h2>
          <p className="font-body text-muted-foreground mb-10">
            Inscreva-se para receber novidades exclusivas e ofertas especiais
          </p>

          {isSubmitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="font-body text-foreground"
            >
              Obrigada por se inscrever! ✨
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu e-mail"
                required
                className="flex-1 px-6 py-4 bg-transparent border border-border font-body text-sm focus:outline-none focus:border-foreground transition-colors duration-300"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase flex items-center justify-center gap-2 hover:bg-foreground/90 transition-colors duration-300"
              >
                Inscrever
                <ArrowRight size={16} />
              </motion.button>
            </form>
          )}
        </AnimatedSection>
      </div>
    </section>
  );
};

export default Newsletter;
