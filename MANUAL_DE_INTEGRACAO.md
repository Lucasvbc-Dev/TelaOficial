# 🚀 Manual de Integração - Tela E-commerce

Bem-vindo! Este manual orienta você passo a passo para finalizar o projeto e colocar em produção.

## 📋 Checklist de Integração

- [ ] 1. Preparar arquivo `.env` com credenciais MercadoPago
- [ ] 2. Configurar Firebase Storage para imagens
- [ ] 3. Iniciar Backend (Maven)
- [ ] 4. Iniciar Frontend (npm/bun)
- [ ] 5. Testar fluxo completo de compra
- [ ] 6. Deploy em produção

---

## 1️⃣ Configurar Arquivo .env

### Passo 1: Copiar arquivo de exemplo
```bash
cd backend/backendtela
cp src/main/resources/.env.example src/main/resources/.env
```

### Passo 2: Preencher credenciais MercadoPago

Você mencionou que já possui os **tokens de teste e produção**. Siga os passos abaixo:

#### Para Ambiente de TESTE:

1. Acesse: https://www.mercadopago.com.br/developers/panel
2. Clique em **"Credentials" (Credenciais)**
3. Copie o **Access Token de TEST** (começa com `TEST-...`)
4. Abra o arquivo `.env` e procure por:
   ```properties
   # === MERCADO PAGO (TEST) ===
   MERCADOPAGO_ACCESS_TOKEN_TEST=
   MERCADOPAGO_PUBLIC_KEY_TEST=
   MERCADOPAGO_WEBHOOK_SECRET_TEST=
   ```
5. Cole assim:
   ```properties
   # === MERCADO PAGO (TEST) ===
   MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MERCADOPAGO_PUBLIC_KEY_TEST=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
   MERCADOPAGO_WEBHOOK_SECRET_TEST=sua_chave_de_webhook_de_teste
   ```

#### Para Ambiente de PRODUÇÃO:

1. No mesmo painel do MercadoPago, acesse a aba **"Production"**
2. Copie o **Access Token de PROD** (começa com `PROD-...`)
3. Procure no `.env` por:
   ```properties
   # === MERCADO PAGO (PRODUCTION) ===
   MERCADOPAGO_ACCESS_TOKEN_PROD=
   MERCADOPAGO_PUBLIC_KEY_PROD=
   MERCADOPAGO_WEBHOOK_SECRET_PROD=
   ```
4. Cole assim:
   ```properties
   # === MERCADO PAGO (PRODUCTION) ===
   MERCADOPAGO_ACCESS_TOKEN_PROD=PROD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   MERCADOPAGO_PUBLIC_KEY_PROD=APP_USR_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxxxxxxxxx
   MERCADOPAGO_WEBHOOK_SECRET_PROD=sua_chave_de_webhook_de_producao
   ```

### Passo 3: Configurar Firebase

Se ainda não tiver o arquivo `firebase-service-account.json`:

1. Acesse https://console.firebase.google.com
2. Selecione seu projeto
3. Vá em **"Configurações do Projeto"** → **"Contas de Serviço"**
4. Clique em **"Gerar Nova Chave Privada"**
5. Salve o arquivo JSON em:
   ```
   backend/backendtela/src/main/resources/firebase-service-account.json
   ```

No arquivo `.env`, configure:
```properties
FIREBASE_CREDENTIALS_PATH=classpath:firebase-service-account.json
FIREBASE_DATABASE_URL=https://seu-projeto.firebaseio.com
```

### Passo 4: Configurar CORS para Frontend

No `.env`, defina a URL do seu frontend:
```properties
# === CORS ===
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://seu-dominio.com
```

---

## 2️⃣ Configurar Firebase Storage para Imagens

### Passo 1: Ativar Storage no Firebase

1. Acesse https://console.firebase.google.com
2. Seu projeto
3. **"Storage"** no menu esquerdo
4. Clique em **"Começar"** ou **"Criar bucket"**
5. Escolha uma região (recomendado: `south-america-east1` para Brasil)
6. Defina regras de segurança:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Permitir leitura pública de imagens
    match /produtos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Permitir upload autenticado
    match /uploads/{userId}/{allPaths=**} {
      allow write: if request.auth.uid == userId;
      allow read: if request.auth.uid == userId;
    }
  }
}
```

### Passo 2: Integrar no Frontend

1. Abra: `Frontend/src/services/uploadService.ts` (você pode criar este arquivo)
2. Conte com o código de exemplo abaixo:

```typescript
// uploadService.ts
import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadProdutoImagem(file: File, produtoId: string): Promise<string> {
  try {
    const storageRef = ref(storage, `produtos/${produtoId}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const url = await getDownloadURL(snapshot.ref);
    return url;
  } catch (error) {
    console.error('Erro ao fazer upload:', error);
    throw error;
  }
}
```

### Passo 3: Usar no formulário de produtos

No componente de criação/edição de produto, `Catalogo.tsx`:

```typescript
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    const imageUrl = await uploadProdutoImagem(file, produtoId);
    setImagemUrl(imageUrl);
  }
};
```

---

## 3️⃣ Iniciar o Backend

### Pré-requisitos

- Java 21+ instalado
- Maven 3.9+ instalado
- Firebase configurado

### Executar

```bash
cd backend/backendtela

# Compilar e iniciar
mvn clean spring-boot:run
```

**OU se tiver preferência por IDE:**

1. Abra em VS Code ou IntelliJ
2. Clique em **"Run"** na classe `BackendtelaApplication.java`

**Esperado:**
```
Started BackendtelaApplication in X.XXX seconds
Tomcat started on port(s): 8080
```

### Validar

Abra seu navegador e acesse:
```
http://localhost:8080/actuator/health
```

Você verá:
```json
{"status":"UP"}
```

---

## 4️⃣ Iniciar o Frontend

### Pré-requisitos

- Node.js 18+ ou Bun
- npm ou Bun instalado

### Executar

```bash
cd Frontend

# Instalar dependências (primeira vez)
npm install
# OU com Bun:
bun install

# Iniciar dev server
npm run dev
# OU com Bun:
bun run dev
```

**Esperado:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
```

Abra http://localhost:5173 no navegador.

---

## 5️⃣ Integrar Componentes com Serviços

Você tem novos serviços criados. Integre-os nos componentes:

### 5.1 Página de Produtos (Catalogo.tsx)

Antes (hardcoded):
```typescript
const products = [
  { id: '1', nome: 'Camiseta', preco: 50, ... },
  { id: '2', nome: 'Calça', preco: 120, ... },
];
```

Depois (usando serviço):
```typescript
import { produtoService } from '../services/produtoService';

export default function Catalogo() {
  const [produtos, setProdutos] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    produtoService.listar(page, 12).then(response => {
      setProdutos(response.content);
      setLoading(false);
    }).catch(handleError);
  }, [page]);

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {produtos.map(p => (
        <div key={p.id}>
          <img src={p.imagemUrl} alt={p.nome} />
          <h3>{p.nome}</h3>
          <p>R$ {p.preco.toFixed(2)}</p>
          <button onClick={() => adicionarCarrinho(p)}>Adicionar</button>
        </div>
      ))}
    </div>
  );
}
```

### 5.2 Página de Autenticação (Auth.tsx)

Antes (sem integração):
```typescript
const handleLogin = () => {
  // nada
};
```

Depois:
```typescript
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, senha);
    // Redirecionará automaticamente
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <button disabled={isLoading} type="submit">
        {isLoading ? 'Carregando...' : 'Entrar'}
      </button>
    </form>
  );
}
```

### 5.3 Página de Checkout

Usar o novo `pedidoService`:

```typescript
import { pedidoService } from '../services/pedidoService';
import { pagamentoService } from '../services/pagamentoService';
import { useAuth } from '../contexts/AuthContext';

export default function Checkout() {
  const { usuario } = useAuth();

  const handleCheckout = async () => {
    // 1. Criar pedido
    const pedido = await pedidoService.criar({
      usuarioId: usuario.id,
      itens: cartItems
    });

    // 2. Processar pagamento
    const pagamento = await pagamentoService.pagarComPix({
      pedidoId: pedido.id,
      valor: pedido.total,
      email: usuario.email,
      metodo: 'PIX'
    });

    // 3. Exibir QR Code para o usuário
    console.log('QR Code:', pagamento.qr_code);
  };

  return (
    <button onClick={handleCheckout}>
      Finalizar Compra
    </button>
  );
}
```

---

## 6️⃣ Fluxo Completo de Teste

### Teste 1: Cadastro e Login

1. Abra http://localhost:5173/auth
2. Clique em **"Registrar"**
3. Preencha: Nome, Email, Senha, Telefone, Endereço
4. Clique em **"Registrar"**
5. Você verá uma mensagem de sucesso
6. Clique em **"Fazer Login"**
7. Digite email e senha que acabou de criar
8. Clique em **"Entrar"**
9. ✅ Você será redirecionado para a home logado

### Teste 2: Listar Produtos

1. Clique em **"Catálogo"** no menu
2. Verá produtos carregados do Firebase
3. Pode paginar com as setas de página
4. ✅ Produtos aparecem com imagem, nome e preço

### Teste 3: Adicionar ao Carrinho

1. No catálogo, clique **"Adicionar ao Carrinho"**
2. Abra o carrinho (ícone no header)
3. ✅ Produto aparece no carrinho com quantidade

### Teste 4: Checkout com PIX

1. No carrinho, clique **"Finalizar Compra"**
2. Revise o pedido
3. Clique **"Pagar com PIX"**
4. ✅ Verá QR Code para escanear
5. Abra o app do seu banco e simule pagamento
6. ✅ Status muda para "PAGADO"

### Teste 5: Histórico de Pedidos

1. Clique em **"Meus Pedidos"** no menu
2. ✅ Verá o pedido que acabou de fazer
3. Clique para ver detalhes
4. ✅ Status, itens, valor total aparecem

---

## 🔧 Troubleshooting

### Backend não inicia

**Error**: `Port 8080 already in use`

Solução:
```bash
# Mudar porta no application.properties
server.port=8081

# OU matar processo usando a porta
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux:
lsof -i :8080
kill -9 <PID>
```

### Frontend não conecta ao backend

**Error**: `CORS error` ou `400 Bad Request`

Verifique em `Frontend/src/services/api.ts`:
```typescript
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  // ↑↑↑ Confirme que está apontando para o backend correto
});
```

### MercadoPago - Erro de credenciais

**Error**: `401 Unauthorized` ao tentar processar pagamento

Solução:
1. Verifique se o ACCESS_TOKEN está correto no `.env`
2. Confirme se está usando TEST ou PROD conforme ambiente
3. Teste a credencial direto em:
   ```bash
   curl -H "Authorization: Bearer TEST-xxxxx" \
     https://api.mercadopago.com/v1/payment
   ```

### Firebase - Erro de permissão

**Error**: `Permission denied` ao uploadar imagem

Solução:
1. Configure as regras do Storage conforme mostrado na seção **2️⃣**
2. Verifique se usuário está autenticado no Firebase
3. Teste as regras no simulador do Firebase Console

### Banco de dados vazio

**Problema**: Nenhum produto aparece

Solução:
1. Acesse Firebase Console
2. Vá para **"Firestore Database"**
3. Crie coleção `produtos`
4. Adicione documento com campos:
   ```json
   {
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

## 📞 Suporte - Próximas Etapas

1. **Deploy Backend**: Use Azure, AWS ou Heroku
2. **Deploy Frontend**: Use Vercel ou Netlify
3. **Certificado SSL**: Use Let's Encrypt
4. **Domínio personalizado**: Registre seu domínio
5. **Monitoramento**: Configure logs com Sentry ou DataDog

---

## 💡 Dicas Profissionais

### 1. Variáveis de Ambiente por Ambiente

```bash
# Desenvolvimento
npm run dev        # lê .env.local com localhost:8080

# Produção
npm run build      # lê .env.production com seu-servidor.com
npm run preview
```

### 2. Segurança - Senhas Fortes

Sempre use senhas fortes no teste. Exemplo:
```
Email: teste@example.com
Senha: MinhaSenha123!@#
```

### 3. Testes Automatizados

```bash
# Backend com Maven
mvn test

# Frontend com Vitest
npm run test
```

### 4. Logs em Tempo Real

Backend:
```bash
tail -f target/spring.log
```

Frontend (browser console):
```javascript
// Todos os requests estarão visíveis no console
```

---

## ✅ Checklist Final

Antes de considerar "pronto":

- [ ] `.env` preenchido com credenciais reais
- [ ] Backend inicia sem erros (porta 8080 ativa)
- [ ] Frontend inicia sem erros (porta 5173 ativa)
- [ ] Consegue cadastrar novo usuário
- [ ] Consegue fazer login
- [ ] Produtos aparecem no catálogo
- [ ] Consegue adicionar produtos ao carrinho
- [ ] Consegue processar pagamento com PIX (teste)
- [ ] Pedido aparece em "Meus Pedidos"
- [ ] Admin consegue ver todos os pedidos
- [ ] Imagens fazem upload pro Firebase
- [ ] Webhook recebe notificação de pagamento

---

## 🎉 Parabéns!

Seu e-commerce está pronto! Próximo passo:

1. Adicionar imagens reais dos produtos no Firebase
2. Configurar domínio personalizado
3. Deploy em servidor de produção
4. Monitorar métricas de vendas

Boa sorte! 🚀

---

**Dúvidas?** Consulte também:
- `README.md` - Guia geral do projeto
- `README.PAGAMENTOS.md` - Detalhes de pagamento
- `RESUMO_EXECUTIVO.md` - Visão geral das mudanças
- `CHANGELOG.md` - Histórico completo de alterações
