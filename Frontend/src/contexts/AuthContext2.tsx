import { createContext, useContext, useEffect, useState } from "react";
import api from "@/services/api";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  isAdm?: boolean;
};

export type AuthContextType = {
  usuario: Usuario | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: any) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recuperar autenticação ao carregar página
  useEffect(() => {
    const token = localStorage.getItem("@tela:token");
    const userStorage = localStorage.getItem("@tela:usuario");
    
    if (token && userStorage) {
      try {
        const user = JSON.parse(userStorage);
        setUsuario(user);
      } catch (err) {
        console.error("Erro ao recuperar usuário:", err);
        localStorage.removeItem("@tela:token");
        localStorage.removeItem("@tela:usuario");
      }
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Fazer login com email e senha
   */
  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.post("/usuarios/login", {
        email,
        senha,
      });

      const { token, id, nome, telefone, endereco } = response.data;

      // Salvar token e usuário
      localStorage.setItem("@tela:token", token);
      localStorage.setItem(
        "@tela:usuario",
        JSON.stringify({
          id,
          nome,
          email,
          telefone,
          endereco,
        })
      );

      setUsuario({ id, nome, email, telefone, endereco });
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao fazer login";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Registrar novo usuário
   */
  const register = async (data: {nome: string, email: string, senha: string, telefone: string, endereco: string}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.post("/usuarios", data);
      // Não faz login automático
    } catch (err: any) {
      const message = err.response?.data?.message || "Erro ao registrar";
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fazer logout
   */
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("@tela:token");
    localStorage.removeItem("@tela:usuario");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        register,
        isAuthenticated: !!usuario,
        isLoading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return context;
};
