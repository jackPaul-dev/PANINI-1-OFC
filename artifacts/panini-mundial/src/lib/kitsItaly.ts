import type { Kit } from "./kits";

export type { Kit };

export const kits: Kit[] = [
  {
    id: "basico",
    name: "Kit Base",
    contents: "1 Album + 10 bustine",
    description: "Album con copertina rigida + collezione iniziale (≈70 figurine)",
    price: 14.99,
    oldPrice: 24.99,
    img: "/assets/kit-basico.png",
  },
  {
    id: "iniciante",
    name: "Kit Starter",
    contents: "1 Album + 1 Cassa (30 bustine)",
    description: "Album con copertina rigida + 1 cassa sigillata (≈210 figurine)",
    price: 29.99,
    oldPrice: 44.99,
    img: "/assets/kit-iniciante.png",
  },
  {
    id: "campeao",
    name: "Kit Champion",
    contents: "1 Album + 2 Casse (60 bustine)",
    description: "Album con copertina rigida + 2 casse sigillate (≈420 figurine)",
    price: 39.99,
    oldPrice: 64.99,
    img: "/assets/kit-campeao.png",
    badge: {
      text: "PIÙ VENDUTO",
      colorClass: "bg-red-600 text-white",
    },
  },
  {
    id: "colecionador",
    name: "Kit Collector",
    contents: "1 Album + 3 Casse (90 bustine)",
    description: "Album con copertina rigida + 3 casse sigillate (≈630 figurine)",
    price: 59.99,
    oldPrice: 89.99,
    img: "/assets/kit-colecionador.png",
    badge: {
      text: "MIGLIOR VALORE",
      colorClass: "bg-green-600 text-white",
    },
  },
  {
    id: "dourada",
    name: "Kit Copertina Dorata",
    contents: "1 Album Copertina Dorata + 6 Casse (180 bustine)",
    description: "Album copertina dorata + 6 casse sigillate (≈1.260 figurine)",
    price: 99.99,
    oldPrice: 129.99,
    img: "/assets/kit-capa-dourada.png",
    badge: {
      text: "ESCLUSIVO",
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold",
    },
  },
  {
    id: "estadio",
    name: "Kit Stadio Exclusive",
    contents: "1 Album Copertina Rigida + 250 bustine",
    description: "Album edizione speciale + 250 bustine sigillate (≈1.750 figurine) · Edizione limitata numerata",
    price: 129.99,
    oldPrice: 179.99,
    img: "/assets/kit-estadio.png",
    badge: {
      text: "EDIZIONE LIMITATA",
      colorClass: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-bold",
    },
  },
];
