// ============ DATOS MOCK - DON PALITO JR ============

export const categories = [
  { id: "1", name: "Palitos de Queso" },
  { id: "2", name: "Buñuelos" },
  { id: "3", name: "Bebidas Calientes" },
  { id: "4", name: "Bebidas Frías" },
  { id: "5", name: "Acompañamientos" },
  { id: "6", name: "Combos" },
];

export const products = [
  {
    id: "1",
    name: "Palito de Queso",
    description: "Palito de queso mozzarella. Masa crujiente y dorada.",
    price: 3000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/v1760339152/mozzarella_coctelero_k0sewf.png",
    category: "1",
    available: true,
    rating: 4.8,
    reviewCount: 124,
    featured: true
  },
  {
    id: "2",
    name: "Empanada de Pollo",
    description: "Empanada rellena de pollo desmechado con especias colombianas. Perfecta para cualquier hora.",
    price: 3500,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
    category: "1",
    available: true,
    rating: 4.6,
    reviewCount: 98
  },
  {
    id: "3",
    name: "Empanada de Queso",
    description: "Empanada rellena de queso derretido. Sencilla y deliciosa.",
    price: 3000,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400",
    category: "1",
    available: true,
    rating: 4.5,
    reviewCount: 76
  },
  {
    id: "4",
    name: "Buñuelo Tradicional",
    description: "Buñuelo esponjoso de queso costeño, dorado por fuera y suave por dentro. Receta de la abuela.",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/v1769925024/products/urtcva5pufpktzxbpiqm.png",
    category: "2",
    available: true,
    rating: 4.9,
    reviewCount: 210,
    featured: true
  },
  {
    id: "5",
    name: "Buñuelo Relleno de Arequipe",
    description: "Buñuelo relleno de arequipe cremoso. Un dulce antojo irresistible.",
    price: 3500,
    image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400",
    category: "2",
    available: true,
    rating: 4.7,
    reviewCount: 89
  },
  {
    id: "6",
    name: "Tinto Colombiano",
    description: "Café negro tradicional colombiano. Aromático y con cuerpo.",
    price: 2000,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefda?w=400",
    category: "3",
    available: true,
    rating: 4.4,
    reviewCount: 156
  },
  {
    id: "7",
    name: "Paliplátano",
    description: "Crocante por fuera, Queso, plátano maduro y bocadillo por dentro.",
    price: 1500,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/v1760342322/paliplatano_wkqq0e.png",
    category: "3",
    available: true,
    rating: 4.6,
    reviewCount: 134,
    featured: true
  },
  {
    id: "8",
    name: "Chocolate Caliente",
    description: "Chocolate espeso preparado con cacao colombiano. Servido con queso para derretir.",
    price: 4000,
    image: "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=400",
    category: "3",
    available: true,
    rating: 4.8,
    reviewCount: 178
  },
  {
    id: "9",
    name: "Jugo de Lulo",
    description: "Jugo natural de lulo fresco. Refrescante y lleno de sabor colombiano.",
    price: 4500,
    image: "https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400",
    category: "4",
    available: true,
    rating: 4.5,
    reviewCount: 67
  },
  {
    id: "10",
    name: "Oblea",
    description: "El antojo perfecto: dulce, cremoso y crujiente.",
    price: 5000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/v1760342624/oblea_hpljme.png",
    category: "4",
    available: true,
    rating: 4.7,
    reviewCount: 92,
    featured: true
  },
  {
    id: "11",
    name: "Arepa con Queso",
    description: "Arepa antioqueña asada rellena de queso derretido.",
    price: 4000,
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
    category: "5",
    available: true,
    rating: 4.3,
    reviewCount: 54
  },
  {
    id: "12",
    name: "Hojuela",
    description: "El toque crocante de tus tardes",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/v1760380532/hojuela_pn0axk.png",
    category: "6",
    available: true,
    rating: 4.9,
    reviewCount: 245,
    discount: 15,
    featured: true
  },
];

// ============ HELPER FUNCTIONS ============

export const formatCOP = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0
  }).format(amount);
};

export const getProductsByCategory = (categoryId) => {
  return products.filter((p) => p.category === categoryId);
};

export const getFeaturedProducts = () => {
  return products.filter((p) => p.featured);
};
