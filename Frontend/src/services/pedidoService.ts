import api from './api';

export interface ItemPedido {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
}

export interface Pedido {
  id?: string;
  usuarioId: string;
  itens: ItemPedido[];
  status?: string;
  total?: number;
  createdAt?: string;
}

export interface PedidoAdmin {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  usuarioEmail: string;
  status: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

/**
 * Serviço de Pedidos
 */
export const pedidoService = {
  /**
   * Criar novo pedido
   */
  criar: async (pedido: { itens: ItemPedido[] }): Promise<Pedido> => {
    try {
      const response = await api.post('/pedidos', pedido);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar pedido';
      throw new Error(message);
    }
  },

  /**
   * Listar pedidos do usuário autenticado
   */
  listarMeus: async (usuarioId: string): Promise<Pedido[]> => {
    try {
      const response = await api.get(`/pedidos/usuario/${usuarioId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao listar pedidos';
      throw new Error(message);
    }
  },

  /**
   * Buscar pedido por ID
   */
  buscarPorId: async (pedidoId: string): Promise<Pedido> => {
    try {
      const response = await api.get(`/pedidos/${pedidoId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Pedido não encontrado';
      throw new Error(message);
    }
  },

  /**
   * Listar todos os pedidos (admin only)
   */
  listarAdmin: async (): Promise<PedidoAdmin[]> => {
    try {
      const response = await api.get('/pedidos/admin');
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao listar pedidos';
      throw new Error(message);
    }
  },

  /**
   * Atualizar status do pedido (admin only)
   */
  atualizarStatus: async (pedidoId: string, status: string): Promise<void> => {
    try {
      await api.patch(`/pedidos/admin/${pedidoId}/status`, { status });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar status';
      throw new Error(message);
    }
  },
};
