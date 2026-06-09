// ─────────────────────────────────────────────────────────────────────────────
// SERVER COUNTRY CONFIG — fonte única de verdade para configurações
// específicas de país no lado do servidor (e-mails, rastreamento).
//
// Para clonar este projeto e adaptar para um novo país:
//   1. Altere os valores abaixo para o país-alvo.
//   2. Ajuste os textos dos e-mails (templates em emailTemplates.ts).
//   3. Configure as env vars no Heroku (RESEND_API_KEY, EMAIL_FROM, etc.).
//
// NUNCA hardcode textos de país em emailTemplates.ts — sempre use este arquivo.
// ─────────────────────────────────────────────────────────────────────────────

export const countryConfig = {

  // ── Identidade ───────────────────────────────────────────────────────────────
  country       : "United States",
  countryCode   : "US",
  locale        : "en-US",   // usado em toLocaleDateString e formatações de data
  currency      : "USD",
  currencySymbol: "$",

  // ── Empresa / Rodapé dos e-mails ─────────────────────────────────────────────
  // Ao clonar: ajuste para a entidade legal do país-alvo.
  companyName        : "Panini USA LLC",
  emailSupportLabel  : "Panini USA LLC · Customer Support",
  emailShippingLine  : "Free returns within 30 days · Free shipping across the USA",
  emailCopyrightLine : "Official FIFA World Cup 2026 Licensee",  // prepended with © {year} {companyName}

  // ── Steps do rastreamento de entrega ─────────────────────────────────────────
  // Ao clonar: traduza os labels e subtítulos para o idioma do país-alvo.
  trackingSteps: [
    { label: "Order Confirmed",        sub: "Order successfully processed"    },
    { label: "Order Shipped",          sub: "Departed from warehouse"         },
    { label: "Distribution Center",   sub: "Arrived at logistics hub"        },
    { label: "Out for Delivery",       sub: "Courier is in your area"         },
    { label: "First Delivery Attempt", sub: "Minor delay in progress"        },
    { label: "Locating Package",       sub: "Signal being recovered"          },
    { label: "Customs Review",         sub: "Standard inspection in progress" },
    { label: "Address Verification",  sub: "Awaiting delivery confirmation"  },
    { label: "Order Relaunched",       sub: "New delivery route assigned"     },
    { label: "Delivery Imminent",      sub: "Courier arriving shortly"        },
  ] as { label: string; sub: string }[],

};
