import { Link } from "react-router-dom";
import { Instagram, Facebook, } from "lucide-react";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-6 lg:px-12 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="block mb-6">
              <span className="font-display text-3xl tracking-[0.3em] font-light">
                TELA
              </span>
            </Link>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">
              Elegância atemporal em cada peça. Blusas femininas que celebram a
              sofisticação e o conforto.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-4">Navegação</h4>
            <nav className="space-y-2">
              {[
                { to: "/", label: "Início" },
                { to: "/catalogo", label: "Menu" },
                { to: "/sobre", label: "Sobre" },
                { to: "/contato", label: "Contato" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="block font-body text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-6">Contato</h4>
            <div className="space-y-3 font-body text-sm text-primary-foreground/60">
              <p>contato@tela.com.br</p>
              <p>(85) 8989-1444</p>
              <p>Fortaleza, CE</p>
            </div>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-display text-lg tracking-wider mb-6">Redes Sociais</h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors duration-300"
              >
                <Instagram size={18} />
              </motion.a>
              <motion.a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground hover:text-foreground transition-colors duration-300"
              >
                <Facebook size={18} />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-primary-foreground/10">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <p className="font-body text-xs text-primary-foreground/40 tracking-wider">
              © 2026 TELA. Todos os direitos reservados.
            </p>
            <div className="flex space-x-6 text-xs text-primary-foreground/40">
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
