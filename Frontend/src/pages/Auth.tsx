import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telefone:"",
    endereco:"",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, signUp } = useAuth();



 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!isLogin && formData.password !== formData.confirmPassword) {
    toast({
      title: "Erro",
      description: "As senhas não coincidem.",
      variant: "destructive",
    });
    return;
  }

  try {
    if (isLogin) {
      await signIn(formData.email, formData.password);

      toast({
        title: "Login realizado!",
        description: "Bem-vindo(a) à TELA!",
      });

      navigate("/");
    } else {
      await signUp({
        nome: formData.name,
        email: formData.email,
        telefone: formData.telefone,
        endereco: formData.endereco,
        senha: formData.password,
      });

      toast({
        title: "Conta criada!",
        description: "Cadastro realizado. Agora você pode fazer login.",
      });

      setIsLogin(true);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao conectar com o servidor.";
    toast({
      title: "Erro",
      description: message,
      variant: "destructive",
    });
  }
};


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground items-center justify-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center"
        >
          <span className="font-display text-7xl tracking-[0.4em] font-light text-background">
            TELA
          </span>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-background/50 mt-4">
            Elegância Atemporal
          </p>
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground/95 to-foreground/80" />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, currentColor 35px, currentColor 36px)",
          }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center relative z-10"
        >
          <span className="font-display text-7xl tracking-[0.4em] font-light text-background">
            TELA
          </span>
          <p className="font-body text-sm tracking-[0.3em] uppercase text-background/50 mt-4">
            Elegância Atemporal
          </p>
        </motion.div>
      </div>

      {/* Right - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-body text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft size={16} />
            Voltar ao site
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-10">
            <span className="font-display text-4xl tracking-[0.3em] font-light text-foreground">
              TELA
            </span>
          </div>

          

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="font-display text-3xl lg:text-4xl tracking-wide text-foreground mb-2">
                {isLogin ? "Entrar" : "Criar Conta"}
              </h1>
              <p className="font-body text-muted-foreground mb-10">
                {isLogin
                  ? "Acesse sua conta TELA"
                  : "Junte-se à comunidade TELA"}
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required={!isLogin}
                      className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                      placeholder="Seu nome"
                    />
                  </motion.div>
                )}

                <div>
                  <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                    placeholder="seu@email.com"
                  />
                </div>
                {!isLogin && (
                <div>
                <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                 Telefone
                </label>
                <input
                type="text"
                 name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                required={!isLogin}
                className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                placeholder="(88) 99999-9999"
                 />
                 </div>
                )}
                {!isLogin && (
                  <div>
                <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                 Endereço
                </label>
                <input
                type="text"
                 name="endereco"
                value={formData.endereco}
                onChange={handleChange}
                required={!isLogin}
                className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                placeholder="Rua Exemplo, 123 - Cidade, Estado"
                 />
                 </div>
                  )}
                <div className="relative">
                  <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                    Senha
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 bottom-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block font-body text-xs tracking-widest uppercase text-muted-foreground mb-2">
                      Confirmar Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!isLogin}
                      minLength={6}
                      className="w-full border-b border-border bg-transparent py-3 font-body text-foreground focus:outline-none focus:border-foreground transition-colors"
                      placeholder="••••••••"
                    />
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-foreground text-background font-body text-sm tracking-widest uppercase hover:bg-foreground/90 transition-colors mt-4"
                >
                  {isLogin ? "Entrar" : "Criar Conta"}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isLogin
                    ? "Não tem conta? Criar conta"
                    : "Já tem conta? Entrar"}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
