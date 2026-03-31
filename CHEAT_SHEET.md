# 📋 Cheat Sheet - Comandos Úteis

Referência rápida de comandos mais usados.

---

## 🚀 Iniciando o Projeto

### Backend - Terminal 1
```bash
cd backend/backendtela
mvn clean spring-boot:run

# Alternativa: com IDE
# Clique "Run" em BackendtelaApplication.java
```

**Esperado**: `Tomcat started on port(s): 8080`

---

### Frontend - Terminal 2
```bash
cd Frontend

# Primeira vez: instalar dependências
npm install
# OU com Bun:
bun install

# Iniciar dev server
npm run dev
# OU com Bun:
bun run dev
```

**Esperado**: `VITE v5.x.x ready in XXX ms`

---

## 📧 Testes de API

### Cadastro
```bash
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "João",
    "email": "joao@test.com",
    "senha": "Senha123!",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua A, 123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@test.com",
    "senha": "Senha123!"
  }'

# Você receberá um JSON com "token"
# Copie e use nos próximos comandos
```

### Com Autenticação (use seu TOKEN)
```bash
TOKEN="seuTokenAqui"

curl -X GET http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer $TOKEN"
```

### Listar Produtos
```bash
curl -X GET "http://localhost:8080/api/produtos?page=0&size=12"
```

### Criar Pedido
```bash
TOKEN="seuTokenAqui"

curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "usuarioId": "seu-uuid",
    "itens": [
      {
        "produtoId": "uuid-produto",
        "nome": "Camiseta",
        "preco": 49.90,
        "quantidade": 1
      }
    ]
  }'
```

### Pagar com PIX
```bash
TOKEN="seuTokenAqui"

curl -X POST http://localhost:8080/api/pagamentos/pix \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "pedidoId": "uuid-pedido",
    "valor": 49.90,
    "email": "joao@test.com",
    "metodo": "PIX"
  }'
```

> 📖 Mais exemplos em `API_TESTS.md`

---

## 📁 Arquivos Importantes

### Backend Config
```
backend/backendtela/src/main/resources/
├── application.properties     ← Configuração Spring
├── firebase-service-account.json  ← Credenciais Firebase (não commit)
└── .env.example              ← Template (copiar para .env)
```

### Frontend Config
```
Frontend/
├── package.json              ← Dependências npm
├── vite.config.ts           ← Configuração build
├── tailwind.config.ts       ← Tailwind CSS
└── .env.example             ← Template (copiar para .env)
```

---

## 🔧 Tarefas Comuns

### Instalar Dependência Java (Maven)
```bash
cd backend/backendtela
mvn dependency:tree      # Ver todas as dependências
mvn clean install        # Instalar/atualizar
```

### Instalar Dependência Node
```bash
cd Frontend
npm install nome-do-pacote    # npm
bun add nome-do-pacote         # bun
npm list                      # Ver instaladas
```

### Limpar Build
```bash
# Backend
cd backend/backendtela
mvn clean          # Remove target/

# Frontend
cd Frontend
rm -rf node_modules dist    # Remove caches
npm install                 # Reinstala
```

### Rebuildar
```bash
# Backend
cd backend/backendtela
mvn clean package      # Cria JAR em target/

# Frontend
cd Frontend
npm run build          # Cria dist/ para produção
```

---

## 🐛 Debugging

### Ver Logs Backend
```bash
# Terminal 1 já mostra os logs
# Se precisar salvar em arquivo:
mvn spring-boot:run > app.log 2>&1
tail -f app.log
```

### Ver Logs Frontend
```
# F12 → Console tab
# Abrir DevTools no navegador
# Ctrl+Shift+I (Windows/Linux)
# Cmd+Option+I (Mac)
```

### Testar Conexão Frontend-Backend
```javascript
// No console do navegador (F12 → Console)
fetch('http://localhost:8080/api/productos?page=0&size=1')
  .then(r => r.json())
  .then(d => console.log('OK!', d))
  .catch(e => console.error('ERRO!', e))
```

---

## 🔐 Segurança

### Variáveis Sensíveis
```bash
# NUNCA commitar:
# ❌ .env (local com senhas reais)
# ❌ firebase-service-account.json
# ❌ application.properties (versão local)

# SIM usar:
# ✅ .env.example (template sem senhas)
# ✅ application.properties em produção (via env vars)
```

### Git Ignore
```bash
# Confirme que .gitignore cobre:
.env
firebase-service-account.json
node_modules/
target/
.idea/
.vscode/
```

---

## 📊 Verificar Status

### Backend Saúde
```bash
curl http://localhost:8080/actuator/health
# Esperado: {"status":"UP"}
```

### Frontend Disponível
```bash
Abra http://localhost:5173 no navegador
```

### Porta em Uso?
```bash
# Windows
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :8080
lsof -i :5173
```

### Matar Processo
```bash
# Windows
taskkill /PID <PID> /F

# Mac/Linux
kill -9 <PID>
```

---

## 🔄 Workflow Desenvolvimento

```
1. CÓDIGO
   ├─ Java: Editar + salvar → Backend recarrega
   ├─ TypeScript: Editar + salvar → Frontend recarrega (HMR)

2. TESTAR
   ├─ API: curl commands
   ├─ UI: Abrir no navegador
   ├─ Storage: Firebase Console

3. GIT
   git status
   git add .
   git commit -m "feat: descrição"
   git push

4. DEPLOY
   ├─ Backend: mvn package (cria JAR)
   ├─ Frontend: npm run build (cria dist/)
```

---

## 📚 Documentação Rápida

| Dúvida | Arquivo |
|--------|---------|
| Como começar? | `COMECANDO.md` |
| Como configurar tudo? | `MANUAL_DE_INTEGRACAO.md` |
| Exemplos de API? | `API_TESTS.md` |
| Detalhes técnicos? | `README.md` |
| MercadoPago? | `README.PAGAMENTOS.md` |
| O que mudou? | `CHANGELOG.md` |
| Onde está cada coisa? | `DOCUMENTACAO_INDEX.md` |

---

## 💡 Dicas Rápidas

### Performance
```bash
# Medir tempo de build
time mvn clean package

# Otimizar frontend
npm run build -- --mode production
```

### Debug Firestore
```
1. Abra https://console.firebase.google.com
2. Seu projeto
3. Firestore Database
4. Veja dados em tempo real
```

### Validar JSON
```bash
# Antes de enviar em curl, valide em:
# https://jsonlint.com

curl ... -d '{...}' | jq .    # Pretty print
```

### Enviar Requisição Complexa
```bash
# Salve em arquivo:
cat > pedido.json << EOF
{
  "usuarioId": "uuid",
  "itens": [...]
}
EOF

# Use arquivo:
curl -X POST ... -d @pedido.json
```

---

## 🚀 Deploy Rápido

### Backend (JAR)
```bash
cd backend/backendtela
mvn clean package
# Resultado: target/backendtela-0.0.1-SNAPSHOT.jar

java -jar target/backendtela-0.0.1-SNAPSHOT.jar
```

### Frontend (Vercel)
```bash
cd Frontend
npm run build
# Push para GitHub

# Vercel auto-deploya
```

### Docker (Opcional)
```bash
# Backend Dockerfile:
docker build -t app-backend .
docker run -p 8080:8080 app-backend
```

---

## 📞 Comando de Socorro

Se algo deu errado:

```bash
# 1. Cheque se está na pasta certa
pwd

# 2. Cheque se porta está livre
# (veja acima "Porta em Uso?")

# 3. Limpe caches
# (veja acima "Limpar Build")

# 4. Releia a documentação
# (veja "Documentação Rápida")

# 5. Procure em troubleshooting
# MANUAL_DE_INTEGRACAO.md - Seção 8

# 6. Ainda não funciona?
# Leia DOCUMENTACAO_INDEX.md para todas as respostas
```

---

## ⚡ Atalhos Úteis

### VS Code
```
Ctrl+P           Abrir arquivo
Ctrl+Shift+P     Paleta de comandos
Ctrl+`           Terminal
Ctrl+/           Comentar
Alt+↓            Mover linha
Ctrl+D           Selecionar palavra
F12              DevTools
```

### Git
```bash
git log --oneline              # Histórico compacto
git diff                       # Ver mudanças
git restore <arquivo>          # Descartar mudanças
git reset --hard HEAD~1        # Desfazer último commit
```

### Maven
```bash
mvn -DskipTests clean package  # Build sem testes
mvn test                       # Rodar testes
mvn clean                      # Limpar build
```

---

**Impressão**: `Ctrl+P` + salvar como PDF para ter offline! 🖨️

---

_Última atualização: Janeiro 2024_  
_Versão: 2.0 Profissional_
