# ⚡ COMEÇANDO - Guia Rápido

**Você tem 15 minutos para deixar tudo funcionando localmente!**

---

## 1️⃣ Clonar/Preparar Projeto

```bash
cd path/to/Tela
```

---

## 2️⃣ Configurar .env

```bash
cd backend/backendtela

# Copiar arquivo de exemplo
cp src/main/resources/.env.example src/main/resources/.env

# Editar o arquivo .env
# Preencher com suas credenciais:
# - Firebase (se tiver)
# - MercadoPago (deixar para depois se quiser testar)
# - JWT Secret (deixar como está ok)
```

**Campos essenciais para COMEÇAR**:
```properties
# Firebase (deixe como está ou pule)
FIREBASE_CREDENTIALS_PATH=classpath:firebase-service-account.json

# MercadoPago (deixe vazio por enquanto)
MERCADOPAGO_ACCESS_TOKEN_TEST=TEST-xxxxx
MERCADOPAGO_PUBLIC_KEY_TEST=APP_USR_xxxxx

# JWT (deixe como está)
JWT_SECRET=sua-chave-super-secreta-com-mais-de-32-caracteres-aleatorios!!!
```

---

## 3️⃣ Iniciar Backend

```bash
# Terminal 1
cd backend/backendtela
mvn clean spring-boot:run

# Espere por:
# "Started BackendtelaApplication in X.XXX seconds"
# "Tomcat started on port(s): 8080"
```

**Validar**: Abra no navegador:
```
http://localhost:8080/actuator/health
```

Deve mostrar: `{"status":"UP"}`

---

## 4️⃣ Iniciar Frontend

```bash
# Terminal 2
cd Frontend
npm install    # Primeira vez apenas
npm run dev

# Espere por:
# "VITE v5.x.x  ready in XXX ms"
# "➜  Local:   http://localhost:5173/"
```

**Validar**: Abra no navegador:
```
http://localhost:5173
```

Você verá a home do Tela E-commerce.

---

## 5️⃣ Primeiro Teste - Cadastro

1. Clique em **"Entrar"** no header → **"Registrar"**
2. Preencha:
   - **Nome**: João Silva
   - **Email**: joao@test.com
   - **Senha**: Senha123!
   - **Telefone**: (11) 98765-4321
   - **Endereço**: Rua Teste, 123
3. Clique **"Registrar"**
4. ✅ Se vir "Sucesso" → Backend e Frontend estão falando!

---

## 6️⃣ Teste com cURL (Terminal 3)

Se preferir testar via linha de comando:

```bash
# Cadastro
curl -X POST http://localhost:8080/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Silva",
    "email": "maria@test.com",
    "senha": "SenhaSegura123!",
    "telefone": "(11) 98765-4321",
    "endereco": "Rua A, 123"
  }'

# Login
curl -X POST http://localhost:8080/api/usuarios/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria@test.com",
    "senha": "SenhaSegura123!"
  }'

# Você receberá um token JWT
```

---

## 🎯 Próximos Passos

### Opção A: Testar com Frontend UI (mais fácil)

1. ✅ Você já fez - vá para o passo **8️⃣**

### Opção B: Testar endpoints via cURL (mais técnico)

1. Consulte: `API_TESTS.md` para exemplos detalhados de todos os endpoints

---

## 7️⃣ Adicionar Firebase (Opcional Agora)

Se quiser que os produtos sejam salvos e carregados:

1. Crie conta em https://firebase.google.com
2. Crie um projeto chamado "tela"
3. Vá em **"Settings"** → **"Service Accounts"** → **"Generate New Private Key"**
4. Salve como: `backend/backendtela/src/main/resources/firebase-service-account.json`
5. Reinicie o backend

---

## 8️⃣ Parar Serviços

```bash
# Quando quiser parar:

# Terminal 1 (Backend)
Ctrl + C

# Terminal 2 (Frontend)
Ctrl + C
```

---

## 🆘 Se der Erro

### Backend não inicia
```
Address already in use: port 8080
```
**Solução**: A porta 8080 já está em uso
```bash
# Mude a porta em .env:
server.port=8081

# OU mate a aplicação:
# Windows: netstat -ano | findstr :8080 && taskkill /PID <PID> /F
# Mac/Linux: lsof -i :8080 && kill -9 <PID>
```

---

### Frontend não conecta ao backend
```
CORS error ou 404
```
**Solução**: Confirme que backend está rodando
```bash
# Terminal novo:
curl http://localhost:8080/actuator/health
# Deve retornar: {"status":"UP"}
```

---

### Login não funciona
**Solução**: Confirme que cadastrou o usuário primeiro

---

## 📚 Documentação Completa

Depois de tudo funcionando, leia:

1. **`MANUAL_DE_INTEGRACAO.md`** - Setup com MercadoPago, Firebase Storage, etc.
2. **`API_TESTS.md`** - Exemplos de curl para todos os endpoints
3. **`README.md`** - Documentação técnica completa
4. **`README.PAGAMENTOS.md`** - Guia específico de pagamentos

---

## ✨ Status Atual do Seu Projeto

✅ **Backend **pronto**: Spring Boot 4.0.2 + Java 21
✅ **Frontend pronto**: React 19 + TypeScript + Vite
✅ **Autenticação**: JWT implementado
✅ **Banco**: Firebase Firestore (quando configurar)
✅ **Pagamento**: MercadoPago integrado (aguarda credenciais)
✅ **Validações**: DTOs com validação em todo lugar
✅ **Tratamento de erros**: GlobalExceptionHandler

🔄 **Próximo**: Integrar suas credenciais MercadoPago + Firebase Storage

---

## 🚀 Quando Estiver Funcionando

```bash
# Terminal 1
cd backend/backendtela && mvn spring-boot:run

# Terminal 2
cd Frontend && npm run dev

# Terminal 3 (opcional - para testar API)
bash api-tests.sh

# Abra no navegador:
http://localhost:5173
```

**Pronto!** Seu e-commerce está rodando. 🎉

---

## 💡 Dicas Durante Desenvolvimento

1. **Hot reload**: Frontend recarrega automaticamente (Vite)
2. **Logs backend**: Vá na terminal 1 para ver logs em tempo real
3. **DevTools**: Frontend tem todos os requests em Network (F12)
4. **Restart backend**: Se mudar `application.properties`, precisa reiniciar (Ctrl+C e rodar novamente)

---

**Pronto?** Comece! 👉 Abra dois terminais, execute os comandos do item **3️⃣** e **4️⃣**, e teste!

Dúvidas? Consulte `MANUAL_DE_INTEGRACAO.md` 📖
