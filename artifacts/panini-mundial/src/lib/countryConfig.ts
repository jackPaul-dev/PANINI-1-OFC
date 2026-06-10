// ─────────────────────────────────────────────────────────────────────────────
// COUNTRY CONFIG — fonte única de verdade para tudo que varia por país.
//
// Para clonar este projeto e adaptar para um novo país:
//   1. Altere os valores abaixo para o país-alvo.
//   2. Substitua os assets em /public/assets/ (imagens, logos locais).
//   3. Configure VITE_STRIPE_PUBLISHABLE_KEY da conta Stripe do novo país.
//   4. Ajuste DATABASE_URL, RESEND_API_KEY e demais env vars no Heroku.
//   5. Rebulide e re-faça o deploy.
//
// NUNCA hardcode texto de país nas páginas — sempre use este arquivo.
// ─────────────────────────────────────────────────────────────────────────────

// ── Types ─────────────────────────────────────────────────────────────────────

export type Kit = {
  id: string;
  name: string;
  contents: string;
  description: string;
  price: number;
  oldPrice: number;
  img: string;
  badge?: {
    text: string;
    colorClass: string;
  };
};

export type OrderBump = {
  id: string;
  label: string;
  desc: string;
  price: number;
  oldPrice: number;
  img: string;
  badge: { text: string; cls: string } | null;
};

export type Review = {
  avatar: string;
  name: string;
  city: string;
  title: string;
  text: string;
  verified: string;
};

// ── null  = campo não exibido (USA, Canadá…)
// ── set   = { label: "NIF", placeholder: "12345678A" }  → Itália
//            { label: "CPF", placeholder: "000.000.000-00" } → Brasil
//            { label: "RFC", placeholder: "XAXX010101000" } → México
export type TaxField = { label: string; placeholder: string } | null;

// ─────────────────────────────────────────────────────────────────────────────

const countryConfig = {

  // ── Identidade ───────────────────────────────────────────────────────────────
  country       : "United States",
  countryCode   : "US",           // ISO 3166-1 alpha-2 — usado no Stripe billing_details
  flag          : "🇺🇸",
  language      : "en",
  locale        : "en-US",
  currency      : "USD",
  currencySymbol: "$",
  stripeLocale  : "en" as const,  // locale do Stripe Elements

  // ── Campos do formulário ─────────────────────────────────────────────────────
  phonePlaceholder: "+1 (555) 000-0000",
  taxField        : null as TaxField,  // sem CPF/NIF/RFC para USA
  floorField      : false,             // Itália precisa do campo "andar"

  // ── Campos de endereço ───────────────────────────────────────────────────────
  zipLabel          : "ZIP Code",
  zipPlaceholder    : "10001",
  zipMaxLength      : 10,
  cityPlaceholder   : "New York",
  addressPlaceholder: "123 Main Street",
  aptLabel          : "Apt / Suite / Unit",
  aptPlaceholder    : "Apt 4B",
  stateLabel        : "State",

  // Lista de estados/províncias — substitua pelo equivalente do país-alvo
  stateList: [
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado",
    "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho",
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
    "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey",
    "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina",
    "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia",
    "Washington", "West Virginia", "Wisconsin", "Wyoming",
  ],

  // ── Textos e copy ─────────────────────────────────────────────────────────────
  sport             : "soccer",
  heroTagline       : "The biggest soccer event in history is here!",
  unitsAvailable    : "Only 5,000 units available for the USA",
  socialProof       : "+2,847 American families have already ordered",
  shippingLabel     : "Free Shipping USA",
  shippingDescription: "Free across the entire USA",
  deliveryTime      : "2–4 business days across the USA",
  companyInfo       : "Panini USA LLC · 1 Panini Plaza, New York, NY",
  footerNote        : "SSL Secure · 7-day guarantee · Free Shipping USA",
  confirmationNote  : "Your kit will be delivered in 2–4 business days across the USA.",

  // ── Reviews ───────────────────────────────────────────────────────────────────
  // Substitua por depoimentos de clientes do país-alvo.
  reviews: [
    {
      avatar  : "/assets/avatar-carlos.png",
      name    : "John Mitchell",
      city    : "New York, NY",
      title   : "Super fast delivery!",
      text    : "Ordered on Tuesday and it arrived by Thursday. The kit came perfectly packaged and my son went absolutely crazy when he opened it. Outstanding service!",
      verified: "Verified purchase — 2 days ago",
    },
    {
      avatar  : "/assets/avatar-amanda.png",
      name    : "Sarah Johnson",
      city    : "Los Angeles, CA",
      title   : "Best price anywhere",
      text    : "I checked multiple sites and this had the best price by far. Plus free shipping! Already recommended it to two friends who ordered right away.",
      verified: "Verified purchase — 3 days ago",
    },
    {
      avatar  : "/assets/avatar-roberto.png",
      name    : "Mike Davis",
      city    : "Chicago, IL",
      title   : "100% authentic Panini",
      text    : "I was a bit skeptical about buying online, but everything arrived factory-sealed with the official Panini logo. Same quality as the store and way cheaper.",
      verified: "Verified purchase — 4 days ago",
    },
    {
      avatar  : "/assets/avatar-fernanda.png",
      name    : "Emily Rodriguez",
      city    : "Miami, FL",
      title   : "Worth every penny",
      text    : "Got the biggest kit for me and my husband to complete together. In two afternoons we had already filled more than half the album. Totally worth it.",
      verified: "Verified purchase — 5 days ago",
    },
    {
      avatar  : "/assets/avatar-marcos.png",
      name    : "Chris Thompson",
      city    : "Houston, TX",
      title   : "Second order, just as great",
      text    : "This is my second order and the service is still impeccable. Well packaged, delivered on time, fair price. Will definitely be back.",
      verified: "Verified purchase — 6 days ago",
    },
    {
      avatar  : "/assets/avatar-rita.png",
      name    : "Jessica Lee",
      city    : "Seattle, WA",
      title   : "Finally found this deal",
      text    : "My daughter had been asking for the album for months. Price was unbeatable and it arrived in 3 days. Absolutely recommend!",
      verified: "Verified purchase — 1 day ago",
    },
    {
      avatar  : "/assets/avatar-paulo.png",
      name    : "Daniel Martinez",
      city    : "Phoenix, AZ",
      title   : "Best deal of 2026",
      text    : "Paid by card, checkout was super fast. All boxes factory sealed, exactly as described. Already looking forward to trading duplicates.",
      verified: "Verified purchase — 8 hours ago",
    },
    {
      avatar  : "/assets/avatar-soraia.png",
      name    : "Amanda Wilson",
      city    : "Boston, MA",
      title   : "Perfect as a gift",
      text    : "Gave it to my brother and he was blown away. Support responded within hours when I had a question about delivery. Great experience.",
      verified: "Verified purchase — 12 hours ago",
    },
  ] as Review[],

  // ── Kits — preços em USD ──────────────────────────────────────────────────────
  // Ao clonar: ajuste prices/oldPrice para a moeda do país-alvo.
  kits: [
    {
      id         : "basico",
      name       : "Starter Kit",
      contents   : "1 Album + 10 sticker packs",
      description: "Hardcover album + starter collection (≈70 stickers)",
      price      : 14.99,
      oldPrice   : 24.99,
      img        : "/assets/kit-basico.jpg",
    },
    {
      id         : "iniciante",
      name       : "Fan Kit",
      contents   : "1 Album + 1 Box (30 sticker packs)",
      description: "Hardcover album + 1 sealed box (≈210 stickers)",
      price      : 29.99,
      oldPrice   : 44.99,
      img        : "/assets/kit-iniciante.jpg",
    },
    {
      id         : "campeao",
      name       : "Champion Kit",
      contents   : "1 Album + 2 Boxes (60 sticker packs)",
      description: "Hardcover album + 2 sealed boxes (≈420 stickers)",
      price      : 39.99,
      oldPrice   : 64.99,
      img        : "/assets/kit-campeao.jpg",
      badge      : { text: "BEST SELLER", colorClass: "bg-red-600 text-white" },
    },
    {
      id         : "colecionador",
      name       : "Collector Kit",
      contents   : "1 Album + 3 Boxes (90 sticker packs)",
      description: "Hardcover album + 3 sealed boxes (≈630 stickers)",
      price      : 59.99,
      oldPrice   : 89.99,
      img        : "/assets/kit-colecionador.jpg",
      badge      : { text: "BEST VALUE", colorClass: "bg-green-600 text-white" },
    },
    {
      id         : "dourada",
      name       : "Gold Cover Kit",
      contents   : "1 Gold Cover Album + 6 Boxes (180 sticker packs)",
      description: "Gold hardcover album + 6 sealed boxes (≈1,260 stickers)",
      price      : 99.99,
      oldPrice   : 129.99,
      img        : "/assets/kit-capa-dourada.png",
      badge      : { text: "EXCLUSIVE", colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold" },
    },
    {
      id         : "estadio",
      name       : "Stadium Exclusive Kit",
      contents   : "1 Hardcover Album + 250 sticker packs",
      description: "Special edition hardcover album + 250 sealed sticker packs (≈1,750 stickers) · Numbered limited edition",
      price      : 129.99,
      oldPrice   : 179.99,
      img        : "/assets/kit-estadio.jpg",
      badge      : { text: "LIMITED EDITION", colorClass: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-bold" },
    },
  ] as Kit[],

  // ── Order bumps — preços em USD ───────────────────────────────────────────────
  // Ao clonar: ajuste prices/descriptions para o país-alvo.
  orderBumps: [
    {
      id      : "bump50",
      label   : "+50 sticker packs · ~250 stickers",
      desc    : "Pre-sale discount with free shipping across the USA.",
      price   : 30,
      oldPrice: 40,
      img     : "/assets/caixa1.jpg",
      badge   : null,
    },
    {
      id      : "bump100",
      label   : "+100 sticker packs · ~500 stickers",
      desc    : "The collectors' favorite — exclusive pre-sale deal.",
      price   : 55,
      oldPrice: 125,
      img     : "/assets/caixa2.jpg",
      badge   : { text: "BEST SELLER", cls: "bg-red-600 text-white" },
    },
    {
      id      : "bump250",
      label   : "+250 sticker packs · ~1,250 stickers",
      desc    : "Maximum discount on this promotional lot.",
      price   : 100,
      oldPrice: 625,
      img     : "/assets/caixa3.jpg",
      badge   : { text: "LAST UNITS", cls: "bg-amber-400 text-gray-900" },
    },
  ] as OrderBump[],

};

export default countryConfig;
