import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { MapPin, Phone, Mail, Clock, Instagram, Send } from "lucide-react";


const Contato = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: "Endereço",
      details: ["Rua Leonardo Mota, 1234", "Fortaleza, CE, Brasil"],
    },
    {
      icon: Phone,
      title: "Telefone",
      details: ["(85) 8989-1444"],
    },
    {
      icon: Mail,
      title: "E-mail",
      details: ["contato@tela.com.br"],
    },
    {
      icon: Instagram,
      title: "Instagram",
      details: ["@telatshirt"],
    },
  
  ];

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
            <h1 className="display-heading text-foreground mb-6">Contato</h1>
            <p className="font-body text-lg text-muted-foreground">
              Estamos aqui para ajudar. Entre em contato conosco.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Info */}
            <AnimatedSection>
              <div>
                <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">
                  Informações de Contato
                </h2>

                <div className="space-y-8">
                  {contactInfo.map((item, index) => (
                    <motion.div
                      key={item.title}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex gap-4"
                    >
                      <div className="w-12 h-12 border border-border flex items-center justify-center flex-shrink-0">
                        <item.icon size={20} className="text-foreground" />
                      </div>
                      <div>
                        <h3 className="font-display text-lg text-foreground mb-1">
                          {item.title}
                        </h3>
                        {item.details.map((detail, i) => (
                          <p
                            key={i}
                            className="font-body text-sm text-muted-foreground"
                          >
                            {detail}
                          </p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Social */}
              </div>
            </AnimatedSection>

           {/* Contact Form */} 
           
            <AnimatedSection delay={0.2}>
              <div className="bg-secondary p-8 lg:p-12">
                <h2 className="font-display text-2xl lg:text-3xl text-foreground mb-8">
                  Envie uma Mensagem
                </h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 mx-auto mb-6 border border-foreground flex items-center justify-center">
                      <Send size={24} className="text-foreground" />
                    </div>
                    <h3 className="font-display text-2xl text-foreground mb-4">
                      Mensagem Enviada!
                    </h3>
                    <p className="font-body text-muted-foreground">
                      Obrigada pelo contato. Responderemos em breve.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label className="block font-body text-xs tracking-wider uppercase text-muted-foreground mb-2">
                        Nome
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <label className="block font-body text-xs tracking-wider uppercase text-muted-foreground mb-2">
                        E-mail
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground transition-colors duration-300"
                      />
                    </div>

                    <div>
                      <label className="block font-body text-xs tracking-wider uppercase text-muted-foreground mb-2">
                        Assunto
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground transition-colors duration-300"
                      >
                        <option value="">Selecione</option>
                        <option value="produtos">Dúvidas sobre Produtos</option>
                        <option value="pedidos">Pedidos e Entregas</option>
                        <option value="parcerias">Parcerias</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-body text-xs tracking-wider uppercase text-muted-foreground mb-2">
                        Mensagem
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-background border border-border font-body text-sm focus:outline-none focus:border-foreground transition-colors duration-300 resize-none"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-8 py-4 bg-foreground text-background font-body text-sm tracking-wider uppercase hover:bg-foreground/90 transition-colors duration-300"
                    >
                      Enviar Mensagem
                    </motion.button>
                  </form>
                )}
              </div> 
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contato;
