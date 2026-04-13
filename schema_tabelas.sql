-- EXTENSAO PARA UUID
create extension if not exists "pgcrypto";

-- ENUM PARA STATUS
create type status_pedido as enum (
  'PENDENTE',
  'PAGO',
  'ENVIADO',
  'ENTREGUE',
  'CANCELADO'
);

create type metodo_pagamento as enum (
  'PIX',
  'CARTAO_DE_CREDITO',
  'CARTAO_DE_DEBITO'
);

-- USUARIOS
create table usuarios (
    id uuid primary key default gen_random_uuid(),
    nome varchar(100) not null,
    email varchar(255) not null unique,
    senha_hash varchar(255) not null,
    telefone varchar(20) not null,
    endereco varchar(200) not null,
    created_at timestamp default now()
);

-- PRODUTOS
create table produtos (
    id_produto uuid primary key default gen_random_uuid(),
    nome varchar(100) not null,
    categoria varchar(100) not null,
    descricao varchar(500) not null,
    preco decimal(10,2) not null check (preco >= 0.01),
    ativo boolean not null default true,
    created_at timestamp default now(),
    updated_at timestamp default now()
);

-- IMAGENS DO PRODUTO (AGORA SUPORTA VARIAS)
create table produto_imagens (
    id uuid primary key default gen_random_uuid(),
    produto_id uuid not null,
    url text not null,
    constraint fk_produto_imagens_produto
        foreign key (produto_id)
        references produtos (id_produto)
        on delete cascade
);

-- PEDIDOS
create table pedidos (
    id uuid primary key default gen_random_uuid(),
    usuario_id uuid not null,
    total decimal(10,2) not null check (total >= 0.00),
    status status_pedido not null default 'PENDENTE',
    created_at timestamp default now(),
    constraint fk_pedidos_usuarios
        foreign key (usuario_id)
        references usuarios (id)
        on update cascade
        on delete restrict
);

create index idx_pedidos_usuario_id on pedidos (usuario_id);

-- ITENS DO PEDIDO
create table pedido_itens (
    id uuid primary key default gen_random_uuid(),
    pedido_id uuid not null,
    produto_id uuid not null,
    nome varchar(100) not null,
    preco decimal(10,2) not null check (preco >= 0.01),
    quantidade int not null check (quantidade >= 1),
    constraint fk_pedido_itens_pedidos
        foreign key (pedido_id)
        references pedidos (id)
        on update cascade
        on delete cascade,
    constraint fk_pedido_itens_produtos
        foreign key (produto_id)
        references produtos (id_produto)
        on update cascade
        on delete restrict
);

create index idx_pedido_itens_produto_id on pedido_itens (produto_id);

-- PAGAMENTOS
create table pagamentos (
    id_pagamento uuid primary key default gen_random_uuid(),
    pedido_id uuid not null unique,
    transaction_id varchar(100) unique,
    metodo metodo_pagamento not null,
    status status_pedido not null,
    valor decimal(10,2) not null check (valor >= 0.01),
    constraint fk_pagamentos_pedidos
        foreign key (pedido_id)
        references pedidos (id)
        on update cascade
        on delete cascade
);

create index idx_pagamentos_transaction_id on pagamentos (transaction_id);

-- TRIGGER PARA ATUALIZAR updated_at AUTOMATICAMENTE
create or replace function update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';

create trigger update_produtos_updated_at
before update on produtos
for each row
execute function update_updated_at_column();
