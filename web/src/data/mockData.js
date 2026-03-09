// ============ DATOS REALES SINCRONIZADOS - DON PALITO JR ============

export const categories = [
  { id: "Palitos Cocteleros", name: "Palitos Cocteleros" },
  { id: "Palitos Premium", name: "Palitos Premium" },
  { id: "Especiales", name: "Especiales" },
  { id: "Nuevos", name: "Nuevos" },
  { id: "Dulces", name: "Dulces" },
  { id: "Combos", name: "Combos" },
];

export const products = [
  {
    id: "69946dc25082cbd0b699c59c",
    name: "Palito Coctelero de Puro Queso",
    description: "Versión coctelera del palito relleno de queso mozzarella, pequeño y perfecto para picar.",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760339152/mozzarella_coctelero_k0sewf.png",
    category: "Palitos Cocteleros",
    available: true,
    rating: 4.6,
    reviewCount: 342,
    featured: true
  },
  {
    id: "69946dc25082cbd0b699c59a",
    name: "Palito Premium de Bocadillo y Queso",
    description: "Palito relleno de queso mozzarella con un toque dulce de bocadillo.",
    price: 2500,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1769383615/products/oskq5rdg0sziwtkyusla.png",
    category: "Palitos Premium",
    available: true,
    rating: 4.7,
    reviewCount: 256,
    featured: true
  },
  {
    id: "69946dc25082cbd0b699c5a0",
    name: "Buñuelo",
    description: "Delicioso buñuelo tradicional colombiano, crujiente por fuera y suave por dentro.",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1769925024/products/urtcva5pufpktzxbpiqm.png",
    category: "Especiales",
    available: true,
    rating: 4.5,
    reviewCount: 203,
    featured: true
  },
  {
    id: "69946dc25082cbd0b699c5a7",
    name: "Paliplátano",
    description: "Crocante por fuera, queso maduro y bocadillo por dentro. La perfecta fusión entre un palito de queso y un aborrajado.",
    price: 1500,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760342322/paliplatano_wkqq0e.png",
    category: "Nuevos",
    available: true,
    rating: 4.9,
    reviewCount: 134,
    featured: true
  },
  {
    id: "69946dc25082cbd0b699c59f",
    name: "Oblea",
    description: "Oblea tradicional con arequipe, crema de leche, queso rallado y un toque de mora.",
    price: 5000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760342624/oblea_hpljme.png",
    category: "Dulces",
    available: true,
    rating: 4.2,
    reviewCount: 95,
    featured: true
  },
  {
    id: "69946dc25082cbd0b699c5a4",
    name: "Hojuela",
    description: "Crujiente hojuela, perfecta para combinar con buñuelo y natilla.",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760380532/hojuela_pn0axk.png",
    category: "Especiales",
    available: true,
    rating: 4.2,
    reviewCount: 67,
    featured: false
  },
  {
    id: "69946dc25082cbd0b699c5a5",
    name: "Panocha",
    description: "Delicioso combinado de palito de queso con albondigón, ideal para compartir y disfrutar en grande.",
    price: 6000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760381317/panocha_vdxwcn.png",
    category: "Nuevos",
    available: true,
    rating: 5.0,
    reviewCount: 1,
    featured: false
  },
  {
    id: "69946dc25082cbd0b699c59e",
    name: "Palito de Chocolate y Queso",
    description: "Contraste único de queso mozzarella y chocolate semiamargo.",
    price: 1000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760338066/chocolate_coctelero_mmooyi.png",
    category: "Palitos Cocteleros",
    available: true,
    rating: 5.0,
    reviewCount: 1,
    featured: false
  },
  {
    id: "69946dc25082cbd0b699c5a1",
    name: "Plato de Natilla",
    description: "Porción de natilla casera tradicional.",
    price: 5000,
    image: "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760344131/natilla_porcion_acsrs4.png",
    category: "Especiales",
    available: true,
    rating: 4.7,
    reviewCount: 421,
    featured: false
  }
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