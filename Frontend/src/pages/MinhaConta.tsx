import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import AnimatedSection from "@/components/ui/AnimatedSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";


const MinhaConta = () => {
  const { usuario, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nome: usuario?.nome || "",
    email: usuario?.email || "",
    telefone: usuario?.telefone || "",
    endereco: usuario?.endereco || "",
  });

  useEffect(() => {
  if (!usuario) {
    navigate("/auth");
  }
}, [usuario, navigate]);

  if (!usuario) {
    return null;
  }

  const handleSave = async () => {
  try {
    await updateProfile(form);
    setIsEditing(false);

    toast({ title: "Dados atualizados com sucesso!" });
  } catch (error) {
    console.error(error);
    toast({
      title: "Erro",
      description: "Erro ao atualizar os dados",
      variant: "destructive",
    });
  }
};

  const handleCancel = () => {
    setForm({
      nome: usuario.nome,
      email: usuario.email,
      telefone: usuario.telefone,
      endereco: usuario.endereco,
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    void logout();
    navigate("/auth");
  };

  const fields = [
    { label: "Nome", key: "nome" as const },
    { label: "E-mail", key: "email" as const },
    { label: "Telefone", key: "telefone" as const },
    { label: "Endereço", key: "endereco" as const },
  ];

  return (
    <Layout>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="display-heading text-foreground mb-6">
              Minha Conta
            </h1>
            <p className="font-body text-lg text-muted-foreground">
              Gerencie seus dados pessoais
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 lg:pb-32 bg-background">
        <div className="container mx-auto px-6 lg:px-12 max-w-2xl">
          <AnimatedSection>
            <div className="border border-border rounded-lg p-8 lg:p-10">
              <div className="flex items-center justify-between mb-8">
                <span className="font-body text-xs tracking-[0.3em] uppercase text-muted-foreground">
                  Dados Pessoais
                </span>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="font-body text-xs tracking-widest uppercase gap-2"
                  >
                    <Pencil size={14} />
                    Editar
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                      className="font-body text-xs tracking-widest uppercase gap-2"
                    >
                      <X size={14} />
                      Cancelar
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      className="font-body text-xs tracking-widest uppercase gap-2 bg-foreground text-background hover:bg-foreground/90"
                    >
                      <Check size={14} />
                      Salvar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {fields.map((field) => (
                  <div key={field.key}>
                    <label className="font-body text-sm text-muted-foreground mb-2 block">
                      {field.label}
                    </label>
                    {isEditing ? (
                      <Input
                        value={form[field.key]}
                        onChange={(e) =>
                          setForm({ ...form, [field.key]: e.target.value })
                        }
                        className="font-body"
                      />
                    ) : (
                      <p className="font-body text-foreground text-base py-2 border-b border-border">
                        {usuario?.[field.key] || "—"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 pt-8 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="font-body text-xs tracking-widest uppercase gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                >
                  <LogOut size={14} />
                  Sair da conta
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
};

export default MinhaConta;
