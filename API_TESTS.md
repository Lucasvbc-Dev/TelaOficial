# 🧪 Testes de API - Exemplos com cURL

Use estes exemplos para testar os endpoints da API diretamente via terminal.

> **Base URL**: `http://localhost:8080/api`

---

## 📝 1. Cadastro de Usuário

```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Doe",
    "email": "joao@example.com",
    "senha": "SenhaSegura123!",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua A, 123 - São Paulo, SP"
  }'
```

**Resposta esperada** (201 Created):
```json
{}
```

---

## 🔐 2. Login

```bash
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@example.com",
    "senha": "SenhaSegura123!"
  }'
```

**Resposta esperada** (200 OK):
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "uuid-do-usuario",
  "nome": "João Doe",
  "email": "joao@example.com",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua A, 123 - São Paulo, SP"
}
```

> ⚠️ **Guarde o `token`!** Você usará em todas as chamadas autenticadas.

---

## 👤 3. Buscar Perfil (Autenticado)

```bash
curl -X GET http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Substitua `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` pelo token recebido no login.

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-usuario",
  "nome": "João Doe",
  "email": "joao@example.com",
  "telefone": "(11) 98765-4321",
  "endereco": "Rua A, 123 - São Paulo, SP"
}
```

---

## 📦 4. Listar Produtos (Paginado)

```bash
# Página 0, 12 itens por página, sem filtros
curl -X GET "http://localhost:8080/api/produtos?page=0&size=12" \
  -H "Content-Type: application/json"
```

**Com filtros**:
```bash
curl -X GET "http://localhost:8080/api/produtos?page=0&size=12&categoria=camisetas&busca=basica" \
  -H "Content-Type: application/json"
```

**Resposta esperada** (200 OK):
```json
{
  "content": [
    {
      "id": "uuid-do-produto",
      "nome": "Camiseta Básica",
      "preco": 49.90,
      "descricao": "Camiseta de alta qualidade",
      "imagemUrl": "https://exemplo.com/imagem.jpg",
      "categoria": "camisetas",
      "ativo": true,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "currentPage": 0,
  "pageSize": 12
}
```

---

## 📦 5. Buscar Produto por ID

```bash
curl -X GET http://localhost:8080/api/produtos/uuid-do-produto \
  -H "Content-Type: application/json"
```

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-produto",
  "nome": "Camiseta Básica",
  "preco": 49.90,
  "descricao": "Camiseta de alta qualidade",
  "imagemUrl": "https://exemplo.com/imagem.jpg",
  "categoria": "camisetas",
  "ativo": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-01T00:00:00"
}
```

---

## ➕ 6. Criar Produto (Admin - Autenticado)

```bash
curl -X POST http://localhost:8080/api/produtos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nome": "Calça Jeans Premium",
    "preco": 129.90,
    "descricao": "Calça jeans de alta qualidade para o dia a dia",
    "imagemUrl": "https://exemplo.com/calca.jpg",
    "categoria": "calcas",
    "ativo": true
  }'
```

**Resposta esperada** (201 Created):
```json
{
  "id": "novo-uuid",
  "nome": "Calça Jeans Premium",
  "preco": 129.90,
  "descricao": "Calça jeans de alta qualidade para o dia a dia",
  "imagemUrl": "https://exemplo.com/calca.jpg",
  "categoria": "calcas",
  "ativo": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00"
}
```

---

## ✏️ 7. Atualizar Produto (Admin - Autenticado)

```bash
curl -X PUT http://localhost:8080/api/produtos/uuid-do-produto \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "nome": "Camiseta Premium Atualizada",
    "preco": 69.90,
    "descricao": "Camiseta premium com toque especial",
    "imagemUrl": "https://exemplo.com/camiseta-nova.jpg",
    "categoria": "camisetas",
    "ativo": true
  }'
```

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-produto",
  "nome": "Camiseta Premium Atualizada",
  "preco": 69.90,
  "descricao": "Camiseta premium com toque especial",
  "imagemUrl": "https://exemplo.com/camiseta-nova.jpg",
  "categoria": "camisetas",
  "ativo": true,
  "createdAt": "2024-01-01T00:00:00",
  "updatedAt": "2024-01-15T11:00:00"
}
```

---

## 🗑️ 8. Deletar Produto (Admin - Autenticado)

```bash
curl -X DELETE http://localhost:8080/api/produtos/uuid-do-produto \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada** (204 No Content):
```
[Nenhum body, apenas status HTTP 204]
```

---

## 🛒 9. Criar Pedido (Autenticado)

```bash
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "usuarioId": "uuid-do-usuario",
    "itens": [
      {
        "produtoId": "uuid-do-produto-1",
        "nome": "Camiseta Básica",
        "preco": 49.90,
        "quantidade": 2
      },
      {
        "produtoId": "uuid-do-produto-2",
        "nome": "Calça Jeans",
        "preco": 129.90,
        "quantidade": 1
      }
    ]
  }'
```

**Resposta esperada** (201 Created):
```json
{
  "id": "uuid-do-pedido",
  "usuarioId": "uuid-do-usuario",
  "itens": [
    {
      "produtoId": "uuid-do-produto-1",
      "nome": "Camiseta Básica",
      "preco": 49.90,
      "quantidade": 2
    },
    {
      "produtoId": "uuid-do-produto-2",
      "nome": "Calça Jeans",
      "preco": 129.90,
      "quantidade": 1
    }
  ],
  "total": 229.70,
  "status": "PENDENTE",
  "createdAt": "2024-01-15T12:00:00"
}
```

---

## 📋 10. Buscar Pedido por ID (Autenticado)

```bash
curl -X GET http://localhost:8080/api/pedidos/uuid-do-pedido \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-pedido",
  "usuarioId": "uuid-do-usuario",
  "itens": [...],
  "total": 229.70,
  "status": "PENDENTE",
  "createdAt": "2024-01-15T12:00:00"
}
```

---

## 📋 11. Listar Pedidos do Usuário (Autenticado)

```bash
curl -X GET "http://localhost:8080/api/pedidos/meus-pedidos?usuarioId=uuid-do-usuario" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada** (200 OK):
```json
[
  {
    "id": "uuid-do-pedido-1",
    "usuarioId": "uuid-do-usuario",
    "itens": [...],
    "total": 229.70,
    "status": "PAGADO",
    "createdAt": "2024-01-15T12:00:00"
  },
  {
    "id": "uuid-do-pedido-2",
    "usuarioId": "uuid-do-usuario",
    "itens": [...],
    "total": 99.80,
    "status": "PENDENTE",
    "createdAt": "2024-01-16T10:00:00"
  }
]
```

---

## 📑 12. Listar Todos os Pedidos (Admin - Autenticado)

```bash
curl -X GET http://localhost:8080/api/pedidos/admin/listar \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Resposta esperada** (200 OK):
```json
[
  {
    "id": "uuid-do-pedido",
    "clienteNome": "João Doe",
    "clienteEmail": "joao@example.com",
    "clienteEndereco": "Rua A, 123",
    "itens": [...],
    "total": 229.70,
    "status": "PENDENTE",
    "createdAt": "2024-01-15T12:00:00"
  }
]
```

---

## 🔄 13. Atualizar Status do Pedido (Admin - Autenticado)

```bash
curl -X PATCH http://localhost:8080/api/pedidos/uuid-do-pedido/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "novoStatus": "PAGADO"
  }'
```

**Resposta esperada** (200 OK):
```json
{}
```

**Status válidos**:
- `PENDENTE` - Pedido criado, aguardando pagamento
- `PAGADO` - Pagamento confirmado
- `ENVIADO` - Em trânsito
- `ENTREGUE` - Recebido pelo cliente
- `CANCELADO` - Pedido cancelado

---

## 💳 14. Pagar com PIX

```bash
curl -X POST http://localhost:8080/api/pagamentos/pix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "pedidoId": "uuid-do-pedido",
    "valor": 229.70,
    "email": "joao@example.com",
    "metodo": "PIX"
  }'
```

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-pagamento",
  "pedidoId": "uuid-do-pedido",
  "valor": 229.70,
  "metodo": "PIX",
  "status": "PENDING",
  "qr_code": "00020126580014br.gov.bcb.pix...",
  "qr_code_url": "https://...imagem.jpg",
  "createdAt": "2024-01-15T12:30:00"
}
```

> ℹ️ Copie o `qr_code` e escaneie com seu app bancário em ambiente de teste.

---

## 💳 15. Pagar com Cartão (Crédito)

```bash
curl -X POST http://localhost:8080/api/pagamentos/cartao \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "pedidoId": "uuid-do-pedido",
    "valor": 229.70,
    "email": "joao@example.com",
    "metodo": "CARTAO",
    "token": "token-gerado-pelo-mercadopago",
    "installments": 3
  }'
```

**Resposta esperada** (200 OK):
```json
{
  "id": "uuid-do-pagamento",
  "pedidoId": "uuid-do-pedido",
  "valor": 229.70,
  "metodo": "CARTAO",
  "status": "APPROVED",
  "installments": 3,
  "installmentValue": 76.57,
  "createdAt": "2024-01-15T12:35:00"
}
```

---

## 🔗 16. Webhook - Notificação de Pagamento (MercadoPago)

Este endpoint é chamado automaticamente pelo MercadoPago quando um pagamento é concluído.

```bash
curl -X POST http://localhost:8080/api/pagamentos/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: signature-do-mercadopago" \
  -d '{
    "id": "1234567890",
    "type": "payment",
    "data": {
      "id": "uuid-do-pagamento-mp"
    }
  }'
```

> ℹ️ Normalmente você NÃO faz esta chamada manualmente. MercadoPago a faz automaticamente.

**Resposta esperada** (200 OK):
```json
{
  "status": "success"
}
```

---

## ⚠️ Tratamento de Erros

Todos os endpoints retornam um JSON padronizado em caso de erro:

### 400 - Bad Request (Validação)
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "status": 400,
  "message": "Invalid input",
  "errors": {
    "nome": "Must not be blank",
    "preco": "Must be greater than 0.01"
  }
}
```

### 401 - Unauthorized (Token inválido)
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "status": 401,
  "message": "Unauthorized",
  "errors": {}
}
```

### 403 - Forbidden (Sem permissão)
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "status": 403,
  "message": "Acesso negado",
  "errors": {}
}
```

### 404 - Not Found
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "status": 404,
  "message": "Produto não encontrado",
  "errors": {}
}
```

### 500 - Internal Server Error
```json
{
  "timestamp": "2024-01-15T12:00:00",
  "status": 500,
  "message": "Internal server error",
  "errors": {}
}
```

---

## 🧪 Script de Teste Completo

Salve como `test-api.sh` e execute com `bash test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:8080/api"
TOKEN=""

echo "🧪 TESTES DA API TELA E-COMMERCE\n"

# 1. Cadastro
echo "1️⃣ Cadastrando novo usuário..."
curl -s -X POST $BASE_URL/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Teste User",
    "email": "teste@example.com",
    "senha": "SenhaSegura123!",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua Teste, 123"
  }' | jq .
echo "\n"

# 2. Login
echo "2️⃣ Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "senha": "SenhaSegura123!"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')
USER_ID=$(echo $LOGIN_RESPONSE | jq -r '.id')

echo $LOGIN_RESPONSE | jq .
echo "\nToken: $TOKEN"
echo "User ID: $USER_ID\n"

# 3. Buscar perfil
echo "3️⃣ Buscando perfil..."
curl -s -X GET $BASE_URL/usuarios/me \
  -H "Authorization: Bearer $TOKEN" | jq .
echo "\n"

# 4. Listar produtos
echo "4️⃣ Listando produtos..."
curl -s -X GET "$BASE_URL/produtos?page=0&size=12" | jq .
echo "\n"

echo "✅ Testes completados!"
```

---

## 💡 Dicas para Testes

1. **Use Postman ou Insomnia**: Ferramentas visuais para testar APIs
2. **Salve credenciais em variáveis**:
   ```bash
   export TOKEN="seu-token-aqui"
   curl -H "Authorization: Bearer $TOKEN" ...
   ```

3. **Pretty print JSON**:
   ```bash
   curl ... | jq .
   ```

4. **Testar com dados reais**: Substitua UUIDs pelos IDs reais do seu banco

5. **Monitore os logs**:
   ```bash
   # Terminal 1: Backend
   cd backend/backendtela && mvn spring-boot:run
   
   # Terminal 2: Testes
   bash test-api.sh
   ```

---

**Próximo passo**: Após validar que toda API está funcionando, integre com o frontend! 🚀
