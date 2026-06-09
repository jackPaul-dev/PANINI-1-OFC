# Panini Mundial 2026 — Guia de Deploy Completo

## Visão Geral

Funil de vendas multi-país do álbum Panini Copa do Mundo 2026.

- **Frontend:** React + Vite (servido como estático pelo Express)
- **Backend:** Express 5 + Drizzle ORM + PostgreSQL
- **Pagamentos:** Stripe (Payment Intents + Apple Pay)
- **E-mail:** Resend (12 e-mails de drip sequence)
- **Analytics:** Facebook Pixel + Meta CAPI (server-side)
- **Produção atual:** https://paniniworldcup2026.site (Heroku)

---

## 1. Pré-requisitos

- Node.js 24+
- pnpm 10+ (`npm install -g pnpm`)
- Conta no Heroku (ou outro host Node.js)
- PostgreSQL (Heroku Postgres ou externo)
- Conta Stripe (live keys)
- Conta Resend (domínio verificado)
- Conta Meta Business (Pixel + CAPI token)

---

## 2. Instalação local

```bash
# Instalar dependências
pnpm install

# Copiar e preencher variáveis de ambiente
cp .env.example .env
# (edite .env com suas chaves — veja seção 4)

# Push do schema no banco
pnpm --filter @workspace/db run push
```

---

## 3. Build

### 3.1 Backend (API Server)

```bash
pnpm --filter @workspace/api-server run build
# Gera: artifacts/api-server/dist/index.mjs
```

### 3.2 Frontend (Panini Mundial)

```bash
cd artifacts/panini-mundial

VITE_STRIPE_PUBLISHABLE_KEY="pk_live_SEU_KEY_AQUI" \
BASE_PATH=/ \
pnpm run build

# Gera: artifacts/panini-mundial/dist/public/
```

> **Importante:** o `VITE_STRIPE_PUBLISHABLE_KEY` é a chave **pública** do Stripe (começa com `pk_live_`). Ela é embutida no bundle do frontend em tempo de build.

---

## 4. Variáveis de Ambiente

Configure estas variáveis no seu servidor/Heroku (Settings → Config Vars):

| Variável | Descrição | Exemplo |
|---|---|---|
| `DATABASE_URL` | Conexão PostgreSQL | `postgres://user:pass@host/db?sslmode=require&channel_binding=disable` |
| `STRIPE_SECRET_KEY` | Chave secreta Stripe | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | `whsec_...` |
| `RESEND_API_KEY` | Chave da API Resend | `re_...` |
| `META_PIXEL_ACCESS_TOKEN` | Token CAPI Meta/Facebook | `EAAN...` |
| `EMAIL_FROM` | Remetente dos e-mails | `Panini USA <noreply@seudominio.com>` |
| `TRACKING_BASE_URL` | URL base de rastreamento | `https://paniniworldcup2026.site` |

> **Atenção — PostgreSQL Heroku:** o `DATABASE_URL` precisa do sufixo `?sslmode=require&channel_binding=disable` para conectar corretamente.

---

## 5. Deploy no Heroku

### 5.1 Criar app e banco

```bash
heroku create meu-app-panini
heroku addons:create heroku-postgresql:essential-0 -a meu-app-panini
```

### 5.2 Configurar variáveis

```bash
heroku config:set DATABASE_URL="postgres://..." -a meu-app-panini
heroku config:set STRIPE_SECRET_KEY="sk_live_..." -a meu-app-panini
heroku config:set STRIPE_WEBHOOK_SECRET="whsec_..." -a meu-app-panini
heroku config:set RESEND_API_KEY="re_..." -a meu-app-panini
heroku config:set META_PIXEL_ACCESS_TOKEN="EAAN..." -a meu-app-panini
heroku config:set EMAIL_FROM="Panini USA <noreply@seudominio.com>" -a meu-app-panini
heroku config:set TRACKING_BASE_URL="https://seudominio.com" -a meu-app-panini
```

### 5.3 Procfile

O repositório já contém o `Procfile` na raiz:

```
web: node --enable-source-maps artifacts/api-server/dist/index.mjs
```

### 5.4 Push e deploy

```bash
# Fazer build local antes do push
pnpm --filter @workspace/api-server run build
cd artifacts/panini-mundial && VITE_STRIPE_PUBLISHABLE_KEY="pk_live_..." BASE_PATH=/ pnpm run build && cd ../..

# Push para o Heroku
git add -A && git commit -m "deploy"
git push heroku main
```

### 5.5 Criar tabela no banco

```bash
heroku run node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
pool.query(\`
  CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    payment_intent_id TEXT UNIQUE NOT NULL,
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    province TEXT,
    country TEXT DEFAULT 'US',
    amount NUMERIC(10,2) NOT NULL,
    items TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
  )
\`).then(() => { console.log('OK'); pool.end(); });
" -a meu-app-panini
```

---

## 6. Stripe — Configuração

### 6.1 Webhook

No Stripe Dashboard → Developers → Webhooks → Add endpoint:

- **URL:** `https://seudominio.com/api/webhook`
- **Eventos:** `payment_intent.succeeded`
- Copie o **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

### 6.2 Apple Pay (opcional)

1. No Stripe Dashboard → Settings → Apple Pay → Add domain
2. Adicione `seudominio.com`
3. O arquivo de verificação já está em `artifacts/panini-mundial/public/.well-known/apple-developer-merchantid-domain-association`

---

## 7. Resend — Configuração de E-mail

1. Crie conta em https://resend.com
2. Adicione e verifique seu domínio (DNS: SPF, DKIM, DMARC)
3. Gere uma API Key → `RESEND_API_KEY`
4. Configure `EMAIL_FROM` com o e-mail do domínio verificado

**Registros DNS necessários:**
```
# SPF (TXT no @ ou domínio raiz)
v=spf1 include:_spf.resend.com ~all

# DKIM (TXT)
resend._domainkey  →  (valor fornecido pelo Resend)

# DMARC (TXT)
_dmarc  →  v=DMARC1; p=none
```

---

## 8. Meta Pixel + CAPI

1. **Pixel ID:** já configurado como `1545212470581501` no frontend (`index.html` + `pixel.ts`)  
   — Se usar outro Pixel, altere em `artifacts/panini-mundial/index.html` e `src/lib/pixel.ts`

2. **CAPI Token:** gere em Meta Business → Events Manager → seu Pixel → Settings → Conversions API → Generate access token  
   → `META_PIXEL_ACCESS_TOKEN`

3. O servidor envia eventos `Purchase` automaticamente via `artifacts/api-server/src/lib/metaCapi.ts` quando o webhook Stripe confirma o pagamento, com deduplicação pelo PaymentIntent ID.

---

## 9. Clonar para Novo País

1. **Frontend** — edite `artifacts/panini-mundial/src/lib/countryConfig.ts`:
   - `country`, `currency`, `currencySymbol`, `locale`
   - `kits` (preços na moeda local), `orderBumps`, `reviews`
   - `states` (lista de estados/províncias), `shippingLabel`, etc.

2. **Backend** — edite `artifacts/api-server/src/lib/countryConfig.ts`:
   - `locale`, `company`, `emailFooter`
   - `trackingSteps` (labels traduzidos)

3. Configure um novo app Heroku com as variáveis da nova conta Stripe + Resend.

4. Rebuilde e faça deploy.

---

## 10. Estrutura do Projeto

```
artifacts/
  panini-mundial/          # Frontend React + Vite
    src/
      pages/               # landing, checkout, presell, tracking
      lib/
        countryConfig.ts   # ← fonte única de verdade (país, moeda, kits)
        pixel.ts           # Facebook Pixel + Meta CAPI client-side
      components/
    dist/public/           # Build estático servido pelo Express
  api-server/              # Backend Express 5
    src/
      routes/
        webhook.ts         # Stripe webhook → drip email + Meta CAPI
        payment.ts         # Payment Intent creation
        emails.ts          # Drip triggers manuais
      lib/
        countryConfig.ts   # ← fonte única de verdade server-side
        emailTemplates.ts  # 12 templates de e-mail
        orderStore.ts      # DB + in-memory hybrid
        metaCapi.ts        # Meta Conversions API (server-side)
    dist/
      index.mjs            # Bundle de produção (commitar após build)
lib/
  db/                      # Drizzle ORM schema + migrations
  api-spec/                # OpenAPI spec + codegen
scripts/                   # Utilitários
```

---

## 11. Comandos Úteis

```bash
# Typecheck completo
pnpm run typecheck

# Build completo
pnpm run build

# Regenerar hooks/schemas da API
pnpm --filter @workspace/api-spec run codegen

# Push de schema no banco (dev)
pnpm --filter @workspace/db run push

# Rodar localmente (dev)
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/panini-mundial run dev
```

---

## 12. Suporte

- **Stripe:** https://dashboard.stripe.com
- **Resend:** https://resend.com/docs
- **Meta Events Manager:** https://business.facebook.com/events_manager
- **Heroku Postgres:** https://devcenter.heroku.com/articles/heroku-postgresql
