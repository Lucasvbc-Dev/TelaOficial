# 🛒 Configuração de Pagamentos - MercadoPago

Este documento descreve como configurar os tokens de teste e produção do MercadoPago para o sistema de pagamentos da loja Tela.

## 1. Obter Credenciais do MercadoPago

### 1.1 Criar Conta

1. Acesse [MercadoPago Developers](https://www.mercadopago.com.br/developers)
2. Crie uma conta ou faça login
3. Acesse o Dashboard de Desenvolvedores

### 1.2 Copiar Credenciais

Na seção "Tus credenciales" você encontrará:
- **Access Token de Teste**: Começa com `TEST-`
- **Access Token de Produção**: Começa com `PROD-`
- **Public Key de Teste**: Para o frontend
- **Public Key de Produção**: Para o frontend

## 2. Configurar Variáveis de Ambiente

### 2.1 Ambiente Local (.env ou application.properties)

```properties
# PAGA Teste
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# OU Produção
MERCADOPAGO_ACCESS_TOKEN=PROD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_PUBLIC_KEY=PROD-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2.2 Arquivo application.properties

```properties
# Mercado Pago - Teste
mercadopago.access-token=${MERCADOPAGO_ACCESS_TOKEN:}
mercadopago.public-key=${MERCADOPAGO_PUBLIC_KEY:}
mercadopago.base-url=https://api.mercadopago.com
mercadopago.webhook-secret=${MERCADOPAGO_WEBHOOK_SECRET:}
```

### 2.3 Sistema de Produção (Docker/Cloud)

Defina as variáveis de ambiente:

**Para Docker:**
```bash
docker run -e MERCADOPAGO_ACCESS_TOKEN=PROD-xxx \
           -e MERCADOPAGO_PUBLIC_KEY=PROD-xxx \
           meu-app
```

**Para Kubernetes:**
```yaml
env:
  - name: MERCADOPAGO_ACCESS_TOKEN
    valueFrom:
      secretKeyRef:
        name: pagamento-secrets
        key: access-token
  - name: MERCADOPAGO_PUBLIC_KEY
    valueFrom:
      secretKeyRef:
        name: pagamento-secrets
        key: public-key
```

**Para Azure App Service:**
```bash
az webapp config appsettings set \
  --resource-group myResourceGroup \
  --name myAppService \
  --settings MERCADOPAGO_ACCESS_TOKEN="PROD-xxx" \
             MERCADOPAGO_PUBLIC_KEY="PROD-xxx"
```

## 3. Endpoints de Pagamento

### 3.1 PIX

**POST** `/pagamentos/pix`

```json
{
  "pedidoId": "62e5d1c0-1234-5678-9abc-def012345678",
  "valor": 150.00,
  "metodo": "PIX",
  "email": "cliente@email.com"
}
```

**Resposta:**
```json
{
  "id": 123456789,
  "status": "pending",
  "point_of_interaction": {
    "transaction_data": {
      "qr_code": "00020126580014br.gov.bcb.brcode...",
      "qr_code_base64": "iVBORw0KGgoAAAANSUhEUgAAA..."
    }
  }
}
```

### 3.2 Cartão de Crédito

**POST** `/pagamentos/cartao`

```json
{
  "pedidoId": "62e5d1c0-1234-5678-9abc-def012345678",
  "valor": 150.00,
  "email": "cliente@email.com",
  "token": "ff8080814c11e84a014c1265ff8f0791",
  "installments": 3
}
```

**Resposta:** Mesmo formato do PIX

## 4. Webhook - Receber Notificações de Pagamento

### 4.1 Registrar URL no MercadoPago

1. Acesse [Panel Seller](https://www.mercadopago.com.br/settings/webhooks)
2. Adicione a URL de webhook: `https://seudominio.com/pagamentos/webhook`
3. Selecione os eventos: `payment.created`, `payment.updated`

### 4.2 Endpoint de Webhook

**POST** `/pagamentos/webhook`

MercadoPago enviará:
```json
{
  "action": "payment.updated",
  "data": {
    "id": "123456789"
  }
}
```

Headers:
- `x-request-id`: ID da requisição
- `x-signature`: Assinatura HMAC SHA256

## 5. Teste com Cartões Demo

### Cartões de Teste (Sandbox)

| Banco | Cartão | CVC | Validade |
|-------|--------|-----|----------|
| Visa | 4111111111111111 | 123 | 11/25 |
| Mastercard | 5555555555554444 | 123 | 11/25 |
| Amex | 378282246310005 | 1234 | 08/25 |

### PIX de Teste

Qualquer valor é aceito em teste.

## 6. Segurança

### ✅ Boas Práticas

- **Nunca** commitar tokens no Git
- Use variáveis de ambiente
- Implemente webhook signature validation
- Use HTTPS em produção
- Valide todos os inputs de cliente
- Implementar rate limiting em endpoints de pagamento

### ❌ O Que Não Fazer

```javascript
// NÃO FAÇA ISSO
const token = "PROD-xxx123"; // Hardcoded
localStorage.setItem("mp_token", token); // No frontend
```

### ✅ O Que Fazer

```bash
# Use variáveis de ambiente
export MERCADOPAGO_ACCESS_TOKEN="PROD-xxx123"
```

## 7. Validação de Webhook

Para validar a assinatura do webhook (implementar no `PagamentoService`):

```java
public boolean validarWebhook(String payload, String signature) {
    String secret = mercadoPagoConfig.getWebhookSecret();
    String hash = HMAC_SHA256(payload, secret);
    return hash.equals(signature);
}
```

## 8. Status de Pagamento

| Status | Significado |
|--------|------------|
| `pending` | Aguardando confirmação |
| `approved` | Aprovado e capturado |
| `authorized` | Autorizado, não capturado |
| `in_process` | Em processamento |
| `rejected` | Rejeitado |
| `cancelled` | Cancelado |
| `refunded` | Reembolsado |
| `charged_back` | Contestado |

## 9. Troubleshooting

### Token inválido

```
Error: Invalid application library: PROD-xxx
```

**Solução:**
1. Verifique se o token começa com `PROD-` ou `TEST-`
2. Copie novamente do painel MercadoPago
3. Restart da aplicação

### Webhook não recebido

1. Verifique se a URL está acessível publicamente
2. Confirme os eventos selecionados no painel
3. Verifique se não há firewall bloqueando

### Erro CORS

```
Access to XMLHttpRequest blocked by CORS policy
```

**Solução:** O servidor está bloqueando a origem. Verifique `app.cors.allowed-origins` em `application.properties`

## 10. Documentação Oficial

- [MercadoPago Docs](https://www.mercadopago.com.br/developers/pt/docs)
- [API Reference](https://www.mercadopago.com.br/developers/pt/reference/_payments_post)
- [SDK Java](https://github.com/mercadopague/sdk-java)

---

**Última atualização:** Março 2026
