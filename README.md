# 🛍️ Tela E-commerce - Site de Roupas

Sistema completo de e-commerce para loja de roupas com React + TypeScript no frontend e Spring Boot no backend.

## 🚀 Stack Tecnológico

### Backend
- **Framework**: Spring Boot 4.0.2
- **Linguagem**: Java 21
- **Database**: Firebase Firestore
- **Autenticação**: JWT (JSON Web Tokens)
- **Pagamentos**: MercadoPago (PIX + Cartão)
- **Deploy**: Azure App Service / Docker / Kubernetes

### Frontend
- **Framework**: React 19 + TypeScript
- **Build**: Vite
- **UI**: Shadcn/UI + Tailwind CSS
- **State Management**: React Context + React Query
- **HTTP Client**: Axios
- **Deploy**: Vercel / Netlify / Azure Static Web Apps

---

## 📋 Tabela de Conteúdos

1. [Instalação](#instalação)
2. [Configuração](#configuração)
3. [Rodando Localmente](#rodando-localmente)
4. [API Endpoints](#api-endpoints)
5. [Estrutura do Projeto](#estrutura-do-projeto)
6. [Deploy](#deploy)
7. [Troubleshooting](#troubleshooting)

---

## ⚙️ Instalação

### Pré-requisitos

- Node.js 18+ e npm/yarn
- Java 21+
- Maven 3.8+
- Git

### Clone o Repositório

```bash
git clone https://github.com/seu-usuario/tela-ecommerce.git
cd tela-ecommerce
```

---

## 🔧 Configuração

### Backend

#### 1. Configurar Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Baixe a chave privada JSON
3. Salve como `firebase-service-account.json` em `backend/backendtela/src/main/resources/`

#### 2. Configurar MercadoPago

1. Crie conta em [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Copie os tokens de **Teste** e/ou **Produção**
3. Crie arquivo `.env` na raiz do projeto:

```bash
# Backend
SPRING_PROFILES_ACTIVE=dev
FIREBASE_PROJECT_ID=seu-projeto-id
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx ou PROD-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx ou PROD-xxx
AUTH_JWT_SECRET=sua-chave-secreta-aleatoria-de-32-caracteres

# Frontend
VITE_API_URL=http://localhost:8080
```

#### 3. Build do Backend

```bash
cd backend/backendtela
mvn clean install

# Ou rodar direto
mvn spring-boot:run
```

### Frontend

#### 1. Instalar Dependências

```bash
cd Frontend
npm install
# ou
yarn install
```

#### 2. Configurar Variáveis de Ambiente

Crie arquivo `.env.local`:

```
VITE_API_URL=http://localhost:8080
VITE_FIREBASE_PROJECT=seu-projeto-id
```

---

## 🏃 Rodando Localmente

### Backend (Terminal 1)

```bash
cd backend/backendtela
mvn spring-boot:run
```

Backend estará disponível em `http://localhost:8080`

**Verificar saúde:**
```bash
curl http://localhost:8080/actuator/health
```

### Frontend (Terminal 2)

```bash
cd Frontend
npm run dev
```

Frontend estará disponível em `http://localhost:5173`

---

## 📌 API Endpoints

### Autenticação

```bash
# Registrar
POST /usuarios
Body: { nome, email, senha, telefone, endereco }

# Login
POST /usuarios/login
Body: { email, senha }
Response: { token, id, nome, email, telefone, endereco }

# Perfil do Usuário
GET /usuarios/me
Headers: Authorization: Bearer ${token}
```

### Produtos

```bash
# Listar (público)
GET /produtos?page=0&size=12&categoria=verao&busca=blusa

# Detalhe (público)
GET /produtos/{id}

# Criar (admin)
POST /produtos
Body: { nome, preco, descricao, categoria, imagemUrl, ativo }

# Atualizar (admin)
PUT /produtos/{id}
Body: { nome, preco, descricao, categoria, imagemUrl, ativo }

# Deletar (admin)
DELETE /produtos/{id}
```

### Pedidos

```bash
# Criar
POST /pedidos
Body: { itens: [{produtoId, nome, preco, quantidade}] }

# Meus Pedidos
GET /pedidos/usuario/{usuarioId}

# Detalhe
GET /pedidos/{pedidoId}

# Listar (admin)
GET /pedidos/admin

# Atualizar Status (admin)
PATCH /pedidos/{pedidoId}/status
Body: { status: "ENTREGUE" }
```

### Pagamentos

```bash
# PIX
POST /pagamentos/pix
Body: { pedidoId, valor, metodo: "PIX", email }
Response: { id, status, point_of_interaction: { transaction_data: { qr_code } } }

# Cartão
POST /pagamentos/cartao
Body: { pedidoId, valor, email, token, installments: 3 }
Response: { id, status, ... }

# Webhook (MercadoPago → seu servidor)
POST /pagamentos/webhook
Headers: x-signature: xxxxx
```

---

## 📁 Estrutura do Projeto

```
TelaOficial/
├── backend/backendtela/
│   ├── src/main/java/backendtela/
│   │   ├── config/              (Firebase, MercadoPago, Security)
│   │   ├── controller/          (REST endpoints)
│   │   ├── service/             (Lógica de negócio)
│   │   ├── repository/          (Firestore queries)
│   │   ├── dto/                 (Data Transfer Objects + validações)
│   │   ├── entidades/           (Modelos de dados)
│   │   ├── exception/           (Exception handlers)
│   │   ├── security/            (JWT, autenticação)
│   │   └── enums/               (Status, Método pagamento)
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   ├── firebase-service-account.json
│   │   └── .env (NÃO COMMITAR)
│   ├── pom.xml
│   └── README.PAGAMENTOS.md
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/          (Header, Footer, Layout)
│   │   │   ├── home/            (Hero, Featured, Newsletter)
│   │   │   ├── cart/            (Carrinho)
│   │   │   └── ui/              (ShadcnUI components)
│   │   ├── pages/               (Index, Catalogo, Checkout, MeusPedidos, etc)
│   │   ├── contexts/            (AuthContext, CartContext)
│   │   ├── services/            (API calls - produtoService, etc)
│   │   ├── hooks/               (Custom hooks)
│   │   ├── lib/                 (Utils)
│   │   └── main.tsx
│   ├── .env.local (NÃO COMMITAR)
│   ├── vite.config.ts
│   └── package.json
│
└── README.md
```

---

## 🚀 Deploy

### Docker

#### Backend

```dockerfile
FROM eclipse-temurin:21-jre
COPY backend/backendtela/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

```bash
docker build -t tela-backend .
docker run -e MERCADOPAGO_ACCESS_TOKEN=PROD-xxx tela-backend
```

#### Frontend

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY Frontend ./
RUN npm install && npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

```bash
docker build -t tela-frontend .
docker run -p 80:80 tela-frontend
```

### Azure

```bash
# Backend
az webapp deployment source config-zip \
  --resource-group myRG \
  --name myAppService \
  --src-path backend-app.zip

# Frontend
az staticwebapp create \
  --name tela-frontend \
  --source ./Frontend
```

### Vercel (Frontend)

```bash
vercel deploy ./Frontend
```

---

## 🧪 Teste com Dados Demo

### Criar Usuário de Teste

```bash
curl -X POST http://localhost:8080/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João Silva",
    "email": "joao@test.com",
    "senha": "123456",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua das Flores, 123, São Paulo"
  }'
```

### Fazer Login

```bash
curl -X POST http://localhost:8080/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "senha": "123456"
  }'
```

Copie o `token` retornado.

### Criar Produto (Admin)

```bash
curl -X POST http://localhost:8080/produtos \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Blusa Verão",
    "preco": 89.90,
    "descricao": "Blusa leve ideal para o verão",
    "categoria": "verao",
    "imagemUrl": "https://...",
    "ativo": true
  }'
```

### Listar Produtos

```bash
curl http://localhost:8080/produtos?page=0&size=12
```

---

## 🔐 Segurança

### Checklist de Segurança

- [x] CORS configurado
- [x] HTTPS em produção (configure via reverse proxy/load balancer)
- [x] Validação de entrada (DTOs com @Validated)
- [x] Proteção contra SQL Injection (Firestore não usa SQL)
- [ ] Rate limiting (implementar no próximo sprint)
- [ ] CSRF protection (desativado para API)
- [ ] Implementar webhook signature validation
- [ ] Implementar 2FA para admin
- [ ] Audit logging

### Senhas Padrões para Teste

⚠️ **NUNCA use em produção!**

- Admin: `admin@tela.com` / `senha123`
- User: `user@tela.com` / `senha123`

---

## 📊 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SPRING_PROFILES_ACTIVE` | Perfil do Spring | `dev`, `prod` |
| `MERCADOPAGO_ACCESS_TOKEN` | Token de acesso MP | `TEST-xxx` ou `PROD-xxx` |
| `MERCADOPAGO_PUBLIC_KEY` | Chave pública MP | `TEST-xxx` ou `PROD-xxx` |
| `AUTH_JWT_SECRET` | Chave JWT (32+ chars) | Gerar com: `openssl rand -base64 32` |
| `FIREBASE_PROJECT_ID` | ID do projeto Firebase | `meu-projeto-123` |
| `APP_CORS_ALLOWED_ORIGINS` | Origins CORS permitidas | `http://localhost:3000,...` |
| `VITE_API_URL` | URL da API (Frontend) | `http://localhost:8080` |

---

## 🐛 Troubleshooting

### "Token inválido" ao fazer login

- Verifique se `AUTH_JWT_SECRET` está configurado
- Restart da aplicação
- Limpe localStorage: `localStorage.clear()`

### "MercadoPago não configurado"

- Copie novamente o token do dashboard MercadoPago
- Confirme se o token começa com `TEST-` ou `PROD-`
- Restart da aplicação

### CORS bloqueando requisições

```javascript
// Frontend está em localhost:3000
// Backend está em localhost:8080
// Adicione ao application.properties:
app.cors.allowed-origins=http://localhost:3000
```

### Produtos não aparecem

1. Verifique se há produtos com `ativo: true`
2. Teste endpoint: `GET /produtos` no Postman
3. Verifique logs do backend

### Webhook do MercadoPago não chega

1. Confirme URL pública está acessível
2. Registre webhook em: https://www.mercadopago.com.br/settings/webhooks
3. Verifique logs de erro

---

## 📚 Documentação Adicional

- [README.PAGAMENTOS.md](/backend/backendtela/README.PAGAMENTOS.md) - Configuração detalhada de pagamentos
- [Firebase Docs](https://firebase.google.com/docs)
- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [React Docs](https://react.dev)

---

## 👥 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob licença MIT. Vejo arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

Para dúvidas e suporte:
- GitHub Issues: [Abra uma issue](https://github.com/seu-usuario/tela-ecommerce/issues)
- Email: suporte@tela.com.br

---

**Desenvolvido com ❤️ para o Tela E-commerce**
