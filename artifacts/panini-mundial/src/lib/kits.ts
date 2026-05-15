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
    name: "Kit Base",
    contents: "1 Album + 10 bustine",
    description: "Copertina rigida + inizio collezione (≈70 figurine)",
    price: 14.99,
    oldPrice: 15.62,
    img: "/assets/kit-basico.png",
  },
  {
    id: "iniciante",
    name: "Kit Principiante",
    contents: "1 Album + 1 Box (30 bustine)",
    description: "Copertina rigida + 1 box sigillata (210 figurine)",
    price: 29.99,
    oldPrice: 39.90,
    img: "/assets/kit-iniciante.png",
  },
  {
    id: "campeao",
    name: "Kit Campione",
    contents: "1 Album + 2 Box (60 bustine)",
    description: "Copertina rigida + 2 box sigillate (420 figurine)",
    price: 39.99,
    oldPrice: 59.90,
    img: "/assets/kit-campeao.png",
    badge: {
      text: "PIÙ VENDUTO",
      colorClass: "bg-red-600 text-white",
    },
  },
  {
    id: "colecionador",
    name: "Kit Collezionista",
    contents: "1 Album + 3 Box (90 bustine)",
    description: "Copertina rigida + 3 box sigillate (630 figurine)",
    price: 59.99,
    oldPrice: 80.00,
    img: "/assets/kit-colecionador.png",
    badge: {
      text: "MIGLIOR VALORE",
      colorClass: "bg-green-600 text-white",
    },
  },
  {
    id: "dourada",
    name: "Kit Album Copertina Dorata",
    contents: "1 Album Copertina Dorata + 6 Box (180 bustine)",
    description: "Copertina rigida dorata + 6 box sigillate (1260 figurine)",
    price: 99.99,
    oldPrice: 119.00,
    img: "/assets/kit-capa-dourada.png",
    badge: {
      text: "ESCLUSIVO",
      colorClass: "bg-gradient-to-r from-yellow-500 to-yellow-300 text-black font-bold",
    },
  },
  {
    id: "estadio",
    name: "Kit Esclusivo Stadio Copertina Rigida",
    contents: "1 Album Copertina Rigida + 250 bustine",
    description: "Copertina rigida edizione speciale + 250 bustine sigillate (1.750 figurine) · Edizione limitata numerata",
    price: 129.99,
    oldPrice: 159.00,
    img: "/assets/kit-estadio.png",
    badge: {
      text: "EDIZIONE LIMITATA",
      colorClass: "bg-gradient-to-r from-amber-700 to-yellow-400 text-white font-bold",
    },
  },
];
