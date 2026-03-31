import { createContext, useContext, useEffect, useState } from "react";

type Usuario = {
  id: any;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  isAdm?: boolean;
};

type AuthContextType = {
  usuario: Usuario | null;
  login: (user: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Mantém login ao atualizar a página
  useEffect(() => {
    const userStorage = localStorage.getItem("@tela:usuario");
    if (userStorage) {
      setUsuario(JSON.parse(userStorage));
    }
  }, []);

  const login = (user: Usuario) => {
    setUsuario(user);
    localStorage.setItem("@tela:usuario", JSON.stringify(user));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("@tela:usuario");
    localStorage.removeItem("@tela:token");
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        login,
        logout,
        isAuthenticated: !!usuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);