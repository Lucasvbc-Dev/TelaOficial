import api from './api';
import { AxiosError } from 'axios';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl: string;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProdutoListResponse {
  content: Produto[];
  currentPage: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
}

/**
 * Serviço de Produtos
 */
export const produtoService = {
  /**
   * Listar produtos com paginação e filtros
   */
  listar: async (
    page: number = 0,
    size: number = 12,
    categoria?: string,
    busca?: string
  ): Promise<ProdutoListResponse> => {
    try {
      const response = await api.get('/produtos', {
        params: {
          page,
          size,
          ...(categoria && { categoria }),
          ...(busca && { busca }),
        },
      });

      return {
        content: response.data.content || [],
        currentPage: response.data.number || 0,
        totalPages: response.data.totalPages || 1,
        totalElements: response.data.totalElements || 0,
        hasNext: response.data.hasNext || false,
      };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao listar produtos';
      throw new Error(message);
    }
  },

  /**
   * Buscar produto por ID
   */
  buscarPorId: async (id: string): Promise<Produto> => {
    try {
      const response = await api.get(`/produtos/${id}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Produto não encontrado';
      throw new Error(message);
    }
  },

  /**
   * Criar novo produto (admin only)
   */
  criar: async (produto: Omit<Produto, 'id' | 'createdAt' | 'updatedAt'>): Promise<Produto> => {
    try {
      const response = await api.post('/produtos', produto);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar produto';
      throw new Error(message);
    }
  },

  /**
   * Atualizar produto (admin only)
   */
  atualizar: async (id: string, produto: Partial<Produto>): Promise<Produto> => {
    try {
      const response = await api.put(`/produtos/${id}`, produto);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar produto';
      throw new Error(message);
    }
  },

  /**
   * Deletar produto (admin only)
   */
  deletar: async (id: string): Promise<void> => {
    try {
      await api.delete(`/produtos/${id}`);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar produto';
      throw new Error(message);
    }
  },
};
