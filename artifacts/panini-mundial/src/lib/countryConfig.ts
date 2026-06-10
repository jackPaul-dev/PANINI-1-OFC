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
//            { label: "TVA", placeholder: "FR12345678901" } → França (opcional B2C)
export type TaxField = { label: string; placeholder: string } | null;

// ─────────────────────────────────────────────────────────────────────────────

const countryConfig = {

  // ── Identidade ───────────────────────────────────────────────────────────────
  country       : "France",
  countryCode   : "FR",           // ISO 3166-1 alpha-2 — usado no Stripe billing_details
  flag          : "🇫🇷",
  language      : "fr",
  locale        : "fr-FR",
  currency      : "EUR",
  currencySymbol: "€",
  stripeLocale  : "fr" as const,  // locale do Stripe Elements

  // ── Campos do formulário ─────────────────────────────────────────────────────
  phonePlaceholder: "+33 6 00 00 00 00",
  taxField        : null as TaxField,  // TVA intracommunautaire — opcional para B2C
  floorField      : false,             // sem campo de andar

  // ── Campos de endereço ───────────────────────────────────────────────────────
  zipLabel          : "Code Postal",
  zipPlaceholder    : "75001",
  zipMaxLength      : 5,
  cityPlaceholder   : "Paris",
  addressPlaceholder: "12 rue de la Paix",
  aptLabel          : "Appartement / Étage / Bâtiment",
  aptPlaceholder    : "Apt 3B",
  stateLabel        : "Région",

  // Liste des 13 régions administratives de France métropolitaine + DOM-TOM
  stateList: [
    "Île-de-France",
    "Auvergne-Rhône-Alpes",
    "Nouvelle-Aquitaine",
    "Occitanie",
    "Hauts-de-France",
    "Provence-Alpes-Côte d'Azur",
    "Grand Est",
    "Normandie",
    "Pays de la Loire",
    "Bretagne",
    "Bourgogne-Franche-Comté",
    "Centre-Val de Loire",
    "Corse",
    "Guadeloupe",
    "Martinique",
    "Guyane",
    "La Réunion",
    "Mayotte",
  ],

  // ── Textes et copy ────────────────────────────────────────────────────────────
  sport             : "football",
  heroTagline       : "Le plus grand événement football de l'histoire est là !",
  unitsAvailable    : "Seulement 5 000 exemplaires disponibles pour la France",
  socialProof       : "+2 847 familles françaises ont déjà commandé",
  shippingLabel     : "Livraison gratuite France",
  shippingDescription: "Livraison gratuite partout en France",
  deliveryTime      : "3–5 jours ouvrés partout en France",
  companyInfo       : "Panini France SAS · 12 rue du Commerce, 75015 Paris",
  footerNote        : "Paiement sécurisé SSL · Garantie 7 jours · Livraison gratuite France",
  confirmationNote  : "Votre kit sera livré en 3–5 jours ouvrés partout en France.",

  // ── Avis clients ──────────────────────────────────────────────────────────────
  reviews: [
    {
      avatar  : "/assets/avatar-carlos.png",
      name    : "Jean-Pierre Dupont",
      city    : "Paris, Île-de-France",
      title   : "Livraison ultra rapide !",
      text    : "Commandé mardi, reçu jeudi. Le kit est arrivé parfaitement emballé et mon fils a sauté de joie en l'ouvrant. Service impeccable !",
      verified: "Achat vérifié — il y a 2 jours",
    },
    {
      avatar  : "/assets/avatar-amanda.png",
      name    : "Marie Lefevre",
      city    : "Lyon, Auvergne-Rhône-Alpes",
      title   : "Meilleur prix du marché",
      text    : "J'ai comparé sur plusieurs sites et c'était de loin le meilleur rapport qualité-prix. Et la livraison est gratuite ! J'en ai déjà parlé à deux amies qui ont commandé.",
      verified: "Achat vérifié — il y a 3 jours",
    },
    {
      avatar  : "/assets/avatar-roberto.png",
      name    : "Thomas Bernard",
      city    : "Marseille, PACA",
      title   : "100 % Panini officiel",
      text    : "J'étais un peu sceptique sur l'achat en ligne, mais tout est arrivé sous blister officiel avec le logo Panini. Même qualité qu'en magasin et bien moins cher.",
      verified: "Achat vérifié — il y a 4 jours",
    },
    {
      avatar  : "/assets/avatar-fernanda.png",
      name    : "Sophie Martin",
      city    : "Bordeaux, Nouvelle-Aquitaine",
      title   : "Vraiment vaut le coup",
      text    : "Pris le grand kit pour moi et mon mari. En deux après-midis on avait déjà rempli plus de la moitié de l'album. Totalement recommandé !",
      verified: "Achat vérifié — il y a 5 jours",
    },
    {
      avatar  : "/assets/avatar-marcos.png",
      name    : "Nicolas Petit",
      city    : "Toulouse, Occitanie",
      title   : "Deuxième commande, toujours aussi bien",
      text    : "C'est ma deuxième commande et le service est toujours impeccable. Bien emballé, livré à temps, prix honnête. Je reviendrai sans hésiter.",
      verified: "Achat vérifié — il y a 6 jours",
    },
  ] as Review[],

  // ── Kits — prix en EUR ────────────────────────────────────────────────────────
  kits: [
    {
      id         : "basico",
      name       : "Kit Starter",
      contents   : "1 Album + 10 pochettes",
      description: "Album couverture rigide + collection de départ (≈70 stickers)",
      price      : 12.99,
      oldPrice   : 22.99,
      img        : "/assets/kit-basico.jpg",
    },
    {
      id         : "iniciante",
      name       : "Kit Fan",
      contents   : "1 Album + 1 Boîte (30 pochettes)",
      description: "Album couverture rigide + 1 boîte scellée (≈210 stickers)",
      price      : 24.99,
      oldPrice   : 39.99,
      img        : "/assets/kit-iniciante.jpg",
    },
    {
      id         : "campeao",
      name       : "Kit Champion",
      contents   : "1 Album + 2 Boîtes (60 pochettes)",
      description: "Album couverture rigide + 2 boîtes scellées (≈420 stickers)",
      price      : 34.99,
      oldPrice   : 59.99,
      img        : "/assets/kit-campeao.jpg",
      badge      : { text: "LE PLUS VENDU", colorClass: "bg-red-600 text-white" },
    },
    {
      id         : "colecionador",
      name       : "Kit Collectionneur",
      contents   : "1 Album + 3 Boîtes (90 pochettes)",
      description: "Album couverture rigide + 3 boîtes scellées (≈630 stickers)",
      price      : 49.99,
      oldPrice   : 79.99,
      img        : "/assets/kit-colecionador.jpg",
      badge      : { text: "MEILLEUR RAPPORT", colorClass: "bg-green-600 text-white" },
    },
    {
      id         : "dourada",
      name       : "Kit Couverture Or",
      contents   : "1 Album Couverture Or + 6 Boîtes (180 pochettes)",
      description: "Album couverture dorée + 6 boîtes scellées (≈1 260 stickers)",
      price      : 109.99,
      oldPrice   : 149.99,
      img        : "/assets/kit-capa-dourada.png",
      badge      : { text: "EXCLUSIF", colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold" },
    },
    {
      id         : "estadio",
      name       : "Kit Stade Exclusif",
      contents   : "1 Album Couverture Rigide + 250 pochettes",
      description: "Édition spéciale couverture rigide + 250 pochettes scellées (≈1 750 stickers) · Numérotée édition limitée",
      price      : 129.99,
      oldPrice   : 179.99,
      img        : "/assets/kit-estadio.jpg",
      badge      : { text: "ÉDITION LIMITÉE", colorClass: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-bold" },
    },
  ] as Kit[],

  // ── Order bumps — prix en EUR ──────────────────────────────────────────────────
  orderBumps: [
    {
      id      : "bump50",
      label   : "+50 pochettes · ~250 stickers",
      desc    : "Remise pré-vente avec livraison gratuite en France.",
      price   : 25,
      oldPrice: 35,
      img     : "/assets/caixa1.jpg",
      badge   : null,
    },
    {
      id      : "bump100",
      label   : "+100 pochettes · ~500 stickers",
      desc    : "Le favori des collectionneurs — offre pré-vente exclusive.",
      price   : 45,
      oldPrice: 100,
      img     : "/assets/caixa2.jpg",
      badge   : { text: "LE PLUS VENDU", cls: "bg-red-600 text-white" },
    },
    {
      id      : "bump250",
      label   : "+250 pochettes · ~1 250 stickers",
      desc    : "Remise maximale sur ce lot promotionnel.",
      price   : 85,
      oldPrice: 500,
      img     : "/assets/caixa3.jpg",
      badge   : { text: "DERNIÈRES UNITÉS", cls: "bg-amber-400 text-gray-900" },
    },
  ] as OrderBump[],

};

export default countryConfig;
