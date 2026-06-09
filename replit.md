# Panini Mundial 2026

Multi-country Panini World Cup 2026 sticker album sales funnel with email drip sequences, Stripe payments, and real-time order tracking.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Email: Resend (drip sequence, 12 emails)
- Payments: Stripe (Payment Intents + Apple Pay)

## Where things live

- `artifacts/panini-mundial/src/pages/` — all funnel pages (landing, checkout, presell, tracking)
- `artifacts/panini-mundial/src/pages/countries/` — per-country pages (italy/)
- `artifacts/panini-mundial/src/lib/kits.ts` — USA/English kit definitions (USD)
- `artifacts/panini-mundial/src/lib/kitsItaly.ts` — Italy kit definitions (EUR)
- `artifacts/panini-mundial/src/components/Header.tsx` — locale-aware header (en/it props)
- `artifacts/api-server/src/lib/emailTemplates.ts` — English email drip (12 variants)
- `artifacts/api-server/src/routes/` — API routes (emails, payment, webhook)

## Architecture decisions

- Root `/` is the USA funnel (English, USD). Italy lives at `/italy/*`.
- Other countries (Spain, France, Brazil, Mexico, Germany, Portugal) show a ComingSoon placeholder.
- `Header` component accepts `locale="en" | "it"` — defaults to `"en"` (USA). Italy pages pass `locale="it"`.
- Email drip sequences are in English/USD. All 12 email variants are generated from a single `shell()` wrapper.
- Heroku deployment: `node --enable-source-maps artifacts/api-server/dist/index.mjs`. Dist files committed.
- Build command (frontend): `cd artifacts/panini-mundial && VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... BASE_PATH=/ pnpm run build`

## Product

- Landing page → presell page → checkout (Stripe + Apple Pay) → order confirmation
- Automated 12-email drip sequence (day 0 through day 10 + failed/rerouted delivery)
- Order tracking page at `/seguimiento?orderId=XXX`
- Multi-country architecture ready to activate (ComingSoon pages for 7 countries)

## User preferences

- Responder sempre em **português do Brasil (PT-BR)**.

## Gotchas

- Stripe API version must match `@stripe/stripe-js` installed version. Currently `"2026-04-22.dahlia"`.
- Apple Pay domain verification file at `public/.well-known/apple-developer-merchantid-domain-association` — must register domain in Stripe Dashboard.
- Heroku needs env vars: `RESEND_API_KEY`, `EMAIL_FROM`, `TRACKING_BASE_URL=https://paniniworldcup2026.site`, `DATABASE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`.
- DB connection: requires `?sslmode=require&channel_binding=disable` suffix on `DATABASE_URL` for Heroku Postgres.
- Italy checkout uses `nif` (tax ID) and `andar` (floor) fields; USA checkout does not.
- Email payload cast to Resend requires `as unknown as Parameters<...>` double-cast due to strict TS.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
