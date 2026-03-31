import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/services/api";

const MeusPedidos = () => {
  const { usuario } = useAuth();
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    if (!usuario) return;

    api
      .get(`/pedidos/usuario/${usuario.id}`)
      .then((res) => setPedidos(res.data));
  }, [usuario]);

  return (
    <div className="max-w-3xl mx-auto pt-32 px-6">
      <h1 className="text-2xl mb-6">Meus Pedidos</h1>

      {pedidos.length === 0 ? (
        <p>Nenhum pedido encontrado.</p>
      ) : (
        pedidos.map((pedido: any) => (
          <div
            key={pedido.id}
            className="border p-4 mb-4"
          >
            <p className="text-sm">
              <strong>Status:</strong>{" "}
              <span className="uppercase">{pedido.status}</span>
            </p>

            <p className="text-sm">
              <strong>Total:</strong> R$ {pedido.total}
            </p>

            <div className="mt-2">
              {pedido.itens.map((item: any, index: number) => (
                <div key={index} className="text-sm">
                  {item.quantidade}x {item.nome}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MeusPedidos;