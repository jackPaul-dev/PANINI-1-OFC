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

export const kits: Kit[] = [
  {
    id: "basico",
    name: "Starter Kit",
    contents: "1 Album + 10 sticker packs",
    description: "Hardcover album + starter collection (≈70 stickers)",
    price: 14.99,
    oldPrice: 24.99,
    img: "/assets/kit-basico.png",
  },
  {
    id: "iniciante",
    name: "Fan Kit",
    contents: "1 Album + 1 Box (30 sticker packs)",
    description: "Hardcover album + 1 sealed box (≈210 stickers)",
    price: 29.99,
    oldPrice: 44.99,
    img: "/assets/kit-iniciante.png",
  },
  {
    id: "campeao",
    name: "Champion Kit",
    contents: "1 Album + 2 Boxes (60 sticker packs)",
    description: "Hardcover album + 2 sealed boxes (≈420 stickers)",
    price: 39.99,
    oldPrice: 64.99,
    img: "/assets/kit-campeao.png",
    badge: {
      text: "BEST SELLER",
      colorClass: "bg-red-600 text-white",
    },
  },
  {
    id: "colecionador",
    name: "Collector Kit",
    contents: "1 Album + 3 Boxes (90 sticker packs)",
    description: "Hardcover album + 3 sealed boxes (≈630 stickers)",
    price: 59.99,
    oldPrice: 89.99,
    img: "/assets/kit-colecionador.png",
    badge: {
      text: "BEST VALUE",
      colorClass: "bg-green-600 text-white",
    },
  },
  {
    id: "dourada",
    name: "Gold Cover Kit",
    contents: "1 Gold Cover Album + 6 Boxes (180 sticker packs)",
    description: "Gold hardcover album + 6 sealed boxes (≈1,260 stickers)",
    price: 99.99,
    oldPrice: 129.99,
    img: "/assets/kit-capa-dourada.png",
    badge: {
      text: "EXCLUSIVE",
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold",
    },
  },
  {
    id: "estadio",
    name: "Stadium Exclusive Kit",
    contents: "1 Hardcover Album + 250 sticker packs",
    description: "Special edition hardcover album + 250 sealed sticker packs (≈1,750 stickers) · Numbered limited edition",
    price: 129.99,
    oldPrice: 179.99,
    img: "/assets/kit-estadio.png",
    badge: {
      text: "LIMITED EDITION",
      colorClass: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-bold",
    },
  },
];
