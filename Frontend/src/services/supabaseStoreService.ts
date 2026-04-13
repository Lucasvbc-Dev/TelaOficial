import { supabase } from "@/lib/supabase";

export type Produto = {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  categoria: string;
  imagemUrl: string;
  ativo: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CartItemPayload = {
  produtoId: string;
  nome: string;
  preco: number;
  quantidade: number;
};

export type UsuarioPerfil = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
  isAdm: boolean;
};

const mapProduto = (row: any, imagemUrl: string): Produto => ({
  id: String(row.id_produto ?? row.id),
  nome: row.nome,
  descricao: row.descricao,
  preco: Number(row.preco || 0),
  categoria: row.categoria,
  imagemUrl,
  ativo: Boolean(row.ativo),
  createdAt: row.created_at || row.createdAt || null,
  updatedAt: row.updated_at || row.updatedAt || null,
});

const loadImagemPrincipalMap = async (produtoIds: string[]) => {
  if (!produtoIds.length) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("produto_imagens")
    .select("produto_id, url")
    .in("produto_id", produtoIds);

  assertNoError(error, "Erro ao carregar imagens dos produtos");

  const imagemMap = new Map<string, string>();
  for (const imagem of data || []) {
    if (!imagemMap.has(imagem.produto_id)) {
      imagemMap.set(imagem.produto_id, imagem.url || "");
    }
  }

  return imagemMap;
};

const assertNoError = (error: any, fallbackMessage: string) => {
  if (error) {
    throw new Error(error.message || fallbackMessage);
  }
};

export const supabaseStoreService = {
  async listarProdutos(params?: {
    page?: number;
    size?: number;
    categoria?: string;
    busca?: string;
  }) {
    const page = params?.page ?? 0;
    const size = params?.size ?? 12;
    const from = page * size;
    const to = from + size - 1;

    let query = supabase
      .from("produtos")
      .select("*", { count: "exact" })
      .eq("ativo", true)
      .order("created_at", { ascending: false, nullsFirst: false });

    if (params?.categoria && params.categoria !== "todos") {
      query = query.ilike("categoria", params.categoria);
    }

    if (params?.busca) {
      const busca = params.busca.replace(/,/g, " ").trim();
      if (busca) {
        query = query.or(`nome.ilike.%${busca}%,descricao.ilike.%${busca}%`);
      }
    }

    const { data, error, count } = await query.range(from, to);
    assertNoError(error, "Erro ao listar produtos");

    const totalElements = count || 0;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));

    const produtoIds = (data || []).map((produto: any) => String(produto.id_produto));
    const imagemMap = await loadImagemPrincipalMap(produtoIds);

    return {
      content: (data || []).map((produto: any) =>
        mapProduto(produto, imagemMap.get(String(produto.id_produto)) || ""),
      ),
      currentPage: page,
      totalPages,
      totalElements,
      hasNext: page + 1 < totalPages,
    };
  },

  async listarProdutosDestaque(limit = 3): Promise<Produto[]> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("ativo", true)
      .order("created_at", { ascending: false, nullsFirst: false })
      .limit(limit);

    assertNoError(error, "Erro ao listar destaques");

    const produtoIds = (data || []).map((produto: any) => String(produto.id_produto));
    const imagemMap = await loadImagemPrincipalMap(produtoIds);

    return (data || []).map((produto: any) =>
      mapProduto(produto, imagemMap.get(String(produto.id_produto)) || ""),
    );
  },

  async buscarProdutoPorId(id: string): Promise<Produto> {
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .eq("id_produto", id)
      .single();

    assertNoError(error, "Produto não encontrado");

    const produtoId = String(data.id_produto);
    const imagemMap = await loadImagemPrincipalMap([produtoId]);
    return mapProduto(data, imagemMap.get(produtoId) || "");
  },

  async criarPedido(payload: {
    usuarioId: string;
    itens: CartItemPayload[];
    metodoPagamento: "credito" | "debito" | "pix";
  }) {
    const pedidoId = crypto.randomUUID();
    const pagamentoId = crypto.randomUUID();
    const total = payload.itens.reduce(
      (acc, item) => acc + Number(item.preco) * Number(item.quantidade),
      0,
    );

    const { error: pedidoError } = await supabase.from("pedidos").insert({
      id: pedidoId,
      usuario_id: payload.usuarioId,
      total,
      status: "PENDENTE",
      created_at: new Date().toISOString(),
    });

    assertNoError(pedidoError, "Erro ao criar pedido");

    const itensRows = payload.itens.map((item) => ({
      pedido_id: pedidoId,
      produto_id: item.produtoId,
      nome: item.nome,
      preco: Number(item.preco),
      quantidade: Number(item.quantidade),
    }));

    const { error: itensError } = await supabase.from("pedido_itens").insert(itensRows);
    if (itensError) {
      await supabase.from("pedidos").delete().eq("id", pedidoId);
      throw new Error(itensError.message || "Erro ao salvar itens do pedido");
    }

    const metodo =
      payload.metodoPagamento === "pix"
        ? "PIX"
        : payload.metodoPagamento === "debito"
          ? "CARTAO_DE_DEBITO"
          : "CARTAO_DE_CREDITO";

    const { error: pagamentoError } = await supabase.from("pagamentos").insert({
      id_pagamento: pagamentoId,
      pedido_id: pedidoId,
      transaction_id: null,
      metodo,
      status: "PENDENTE",
      valor: total,
    });

    if (pagamentoError) {
      throw new Error(pagamentoError.message || "Erro ao criar pagamento");
    }

    return { id: pedidoId, total, status: "PENDENTE" };
  },

  async listarPedidosUsuario(usuarioId: string) {
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("id, status, total, created_at")
      .eq("usuario_id", usuarioId)
      .order("created_at", { ascending: false, nullsFirst: false });

    assertNoError(error, "Erro ao listar pedidos");

    if (!pedidos?.length) {
      return [];
    }

    const pedidoIds = pedidos.map((pedido) => pedido.id);
    const { data: itens, error: itensError } = await supabase
      .from("pedido_itens")
      .select("pedido_id, nome, quantidade")
      .in("pedido_id", pedidoIds);

    assertNoError(itensError, "Erro ao listar itens dos pedidos");

    const itensPorPedido = (itens || []).reduce((acc: Record<string, any[]>, item) => {
      if (!acc[item.pedido_id]) {
        acc[item.pedido_id] = [];
      }
      acc[item.pedido_id].push(item);
      return acc;
    }, {});

    return pedidos.map((pedido) => ({
      id: pedido.id,
      status: pedido.status,
      total: Number(pedido.total || 0),
      createdAt: pedido.created_at,
      itens: (itensPorPedido[pedido.id] || []).map((item) => ({
        nome: item.nome,
        quantidade: Number(item.quantidade),
      })),
    }));
  },

  async listarPedidosAdmin() {
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("id, usuario_id, status, total, created_at")
      .order("created_at", { ascending: false, nullsFirst: false });
    assertNoError(error, "Erro ao listar pedidos admin");

    if (!pedidos?.length) {
      return [];
    }

    const usuarioIds = [...new Set(pedidos.map((pedido) => pedido.usuario_id))];
    const pedidoIds = pedidos.map((pedido) => pedido.id);

    const [{ data: usuarios, error: usuariosError }, { data: itens, error: itensError }] =
      await Promise.all([
        supabase
          .from("usuarios")
          .select("id, nome, email, endereco")
          .in("id", usuarioIds),
        supabase
          .from("pedido_itens")
          .select("pedido_id, produto_id, nome, preco, quantidade")
          .in("pedido_id", pedidoIds),
      ]);

    assertNoError(usuariosError, "Erro ao listar clientes");
    assertNoError(itensError, "Erro ao listar itens");

    const usuarioMap = new Map((usuarios || []).map((usuario) => [usuario.id, usuario]));
    const itensPorPedido = (itens || []).reduce((acc: Record<string, any[]>, item) => {
      if (!acc[item.pedido_id]) {
        acc[item.pedido_id] = [];
      }
      acc[item.pedido_id].push(item);
      return acc;
    }, {});

    return pedidos.map((pedido) => {
      const usuario = usuarioMap.get(pedido.usuario_id);
      return {
        id: pedido.id,
        nome: usuario?.nome || "Cliente",
        email: usuario?.email || "-",
        endereco: usuario?.endereco || "-",
        itens: (itensPorPedido[pedido.id] || []).map((item) => ({
          produtoId: item.produto_id,
          nome: item.nome,
          preco: Number(item.preco || 0),
          quantidade: Number(item.quantidade || 0),
        })),
        total: Number(pedido.total || 0),
        status: pedido.status,
        createdAt: pedido.created_at,
      };
    });
  },

  async atualizarStatusPedido(pedidoId: string, status: string) {
    const { error } = await supabase
      .from("pedidos")
      .update({ status })
      .eq("id", pedidoId);
    assertNoError(error, "Erro ao atualizar status do pedido");
  },

  async getPerfilUsuario(userId: string): Promise<UsuarioPerfil | null> {
    const { data, error } = await supabase
      .from("usuarios")
      .select("id, nome, email, telefone, endereco, is_adm")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || "Erro ao buscar perfil");
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      nome: data.nome || "",
      email: data.email || "",
      telefone: data.telefone || "",
      endereco: data.endereco || "",
      isAdm: Boolean(data.is_adm),
    };
  },

  async upsertPerfilUsuario(input: {
    id: string;
    nome: string;
    email: string;
    telefone?: string;
    endereco?: string;
  }) {
    const basePayload = {
      id: input.id,
      nome: input.nome,
      email: input.email,
      telefone: input.telefone || "",
      endereco: input.endereco || "",
    };

    const { error } = await supabase.from("usuarios").upsert(basePayload, { onConflict: "id" });
    if (!error) {
      return;
    }

    const { error: fallbackError } = await supabase
      .from("usuarios")
      .upsert({ ...basePayload, senha_hash: "SUPABASE_AUTH" }, { onConflict: "id" });

    assertNoError(fallbackError, "Erro ao salvar perfil de usuário");
  },

  async atualizarPerfilUsuario(
    id: string,
    payload: { nome: string; email: string; telefone: string; endereco: string },
  ) {
    const { error } = await supabase.from("usuarios").update(payload).eq("id", id);
    assertNoError(error, "Erro ao atualizar perfil");
  },
};
