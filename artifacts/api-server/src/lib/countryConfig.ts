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
  country       : "France",
  countryCode   : "FR",
  locale        : "fr-FR",   // usado em toLocaleDateString e formatações de data
  currency      : "EUR",
  currencySymbol: "€",

  // ── Empresa / Rodapé dos e-mails ─────────────────────────────────────────────
  companyName        : "Panini France SAS",
  emailSupportLabel  : "Panini France SAS · Service client",
  emailShippingLine  : "Retours gratuits sous 30 jours · Livraison gratuite partout en France",
  emailCopyrightLine : "Licencié officiel FIFA World Cup 2026",  // prepended with © {year} {companyName}

  // ── Steps du suivi de livraison ───────────────────────────────────────────────
  trackingSteps: [
    { label: "Commande confirmée",       sub: "Commande traitée avec succès"           },
    { label: "Commande expédiée",        sub: "Départ de l'entrepôt"                   },
    { label: "Centre de distribution",  sub: "Arrivée au hub logistique"              },
    { label: "En cours de livraison",   sub: "Le livreur est dans votre secteur"      },
    { label: "Première tentative",      sub: "Léger retard en cours"                  },
    { label: "Localisation du colis",   sub: "Récupération du signal en cours"        },
    { label: "Contrôle douanier",       sub: "Inspection standard en cours"           },
    { label: "Vérification d'adresse",  sub: "En attente de confirmation de livraison"},
    { label: "Commande relancée",       sub: "Nouvelle route de livraison assignée"   },
    { label: "Livraison imminente",     sub: "Le livreur arrive bientôt"              },
  ] as { label: string; sub: string }[],

};
