---
name: Country config template
description: Architecture for cloning the Panini funnel to a new country — two countryConfig.ts files centralize everything country-specific.
---

## Rule
Never hardcode country-specific text, prices, currency, or locale in page components or email templates. Always read from countryConfig.

**Why:** The project is designed to be cloned per country. One file change = new country deployment.

## How to apply
When adding any new copy, price, or locale-sensitive value to a page or email, add it to the corresponding countryConfig first, then reference it.

## Files
- `artifacts/panini-mundial/src/lib/countryConfig.ts` — frontend config (country, currency, locale, kits, orderBumps, reviews, all copy strings, address fields, stateList, taxField, floorField, stripeLocale)
- `artifacts/api-server/src/lib/countryConfig.ts` — server config (locale, companyName, emailSupportLabel, emailShippingLine, emailCopyrightLine, trackingSteps[])
- `artifacts/panini-mundial/src/lib/kits.ts` — re-exports Kit type and kits array from countryConfig (backward-compat only)

## Clone checklist (for a new country)
1. Edit both countryConfig.ts files (country identity, currency, copy, stateList, taxField, kits with local prices, orderBumps, reviews translated)
2. Swap assets in public/assets/ if needed
3. Set Heroku env vars: STRIPE_SECRET_KEY, VITE_STRIPE_PUBLISHABLE_KEY (new Stripe account), RESEND_API_KEY, EMAIL_FROM, TRACKING_BASE_URL, DATABASE_URL
4. Build frontend + API, push to GitHub
