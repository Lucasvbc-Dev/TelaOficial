import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { supabaseStoreService } from "@/services/supabaseStoreService";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  isAdm?: boolean;
};

type AuthContextType = {
  usuario: Usuario | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, senha: string) => Promise<void>;
  signUp: (data: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    senha: string;
  }) => Promise<void>;
  updateProfile: (data: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  }) => Promise<void>;
  refreshUsuario: () => Promise<void>;
  login: (user: Usuario) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const ensureOnline = () => {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    throw new Error("Sem conexão com a internet. Verifique sua rede e tente novamente.");
  }
};

const buildUsuario = async (session: Session): Promise<Usuario> => {
  const authUser = session.user;
  const metadata = authUser.user_metadata || {};

  let perfil = await supabaseStoreService.getPerfilUsuario(authUser.id);

  if (!perfil) {
    await supabaseStoreService.upsertPerfilUsuario({
      id: authUser.id,
      nome: metadata.nome || metadata.name || authUser.email || "Cliente",
      email: authUser.email || "",
      telefone: metadata.telefone || "",
      endereco: metadata.endereco || "",
    });
    perfil = await supabaseStoreService.getPerfilUsuario(authUser.id);
  }

  return {
    id: authUser.id,
    nome: perfil?.nome || metadata.nome || metadata.name || "Cliente",
    email: perfil?.email || authUser.email || "",
    telefone: perfil?.telefone || metadata.telefone || "",
    endereco: perfil?.endereco || metadata.endereco || "",
    isAdm: Boolean(perfil?.isAdm),
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persistUsuario = (user: Usuario | null) => {
    setUsuario(user);
    if (user) {
      localStorage.setItem("@tela:usuario", JSON.stringify(user));
    } else {
      localStorage.removeItem("@tela:usuario");
    }
  };

  const hydrateFromSession = async (session: Session | null) => {
    if (!session) {
      persistUsuario(null);
      return;
    }

    const user = await buildUsuario(session);
    persistUsuario(user);
  };

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        if (mounted) {
          await hydrateFromSession(data.session);
        }
      } catch (error) {
        if (mounted) {
          persistUsuario(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void hydrateFromSession(session);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, senha: string) => {
    ensureOnline();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error || !data.session) {
      const message = error?.message || "Falha ao autenticar";
      if (message.toLowerCase().includes("email not confirmed")) {
        throw new Error("Sua conta ainda não foi confirmada. Verifique seu e-mail ou desative a confirmação de e-mail no Supabase.");
      }
      throw new Error(message);
    }

    const user = await buildUsuario(data.session);
    persistUsuario(user);
  };

  const signUp = async (data: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
    senha: string;
  }) => {
    ensureOnline();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: {
          nome: data.nome,
          telefone: data.telefone,
          endereco: data.endereco,
        },
      },
    });

    if (error) {
      throw new Error(error.message || "Erro ao criar conta");
    }

    const userId = signUpData.user?.id;
    if (!signUpData.session) {
      throw new Error("Conta criada. Verifique seu e-mail para confirmar o cadastro antes de fazer login.");
    }

    if (userId) {
      await supabaseStoreService.upsertPerfilUsuario({
        id: userId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        endereco: data.endereco,
      });
    }
  };

  const updateProfile = async (data: {
    nome: string;
    email: string;
    telefone: string;
    endereco: string;
  }) => {
    ensureOnline();

    if (!usuario) {
      throw new Error("Usuário não autenticado");
    }

    const { error } = await supabase.auth.updateUser({
      email: data.email,
      data: {
        nome: data.nome,
        telefone: data.telefone,
        endereco: data.endereco,
      },
    });

    if (error) {
      throw new Error(error.message || "Erro ao atualizar usuário");
    }

    await supabaseStoreService.atualizarPerfilUsuario(usuario.id, data);
    persistUsuario({ ...usuario, ...data });
  };

  const refreshUsuario = async () => {
    ensureOnline();

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(error.message || "Erro ao carregar sessão");
    }
    await hydrateFromSession(data.session);
  };

  const login = (user: Usuario) => {
    persistUsuario(user);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    persistUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isLoading,
        isAuthenticated: !!usuario,
        signIn,
        signUp,
        updateProfile,
        refreshUsuario,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);