import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const products = [
  {
    name: "Palito Premium de Puro Queso",
    description:
      "Palito relleno de queso mozzarella, crocante y delicioso.",
    price: 2500,
    stock: 50,
    category: "Palitos Premium",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760340777/mozzarella_premium_j9my0e.png",
    ],
    averageRating: 4.5,
    totalReviews: 128,
  },
  {
    name: "Palito Premium de Bocadillo y Queso",
    description:
      "Palito relleno de queso mozzarella con un toque dulce de bocadillo.",
    price: 2500,
    stock: 35,
    category: "Palitos Premium",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1769383615/products/oskq5rdg0sziwtkyusla.png"
    ],
    averageRating: 4.7,
    totalReviews: 256,
  },
  {
    name: "Palito Coctelero de Jamón y Queso",
    description:
      "Combinación clásica de jamón y queso mozzarella.",
    price: 1000,
    stock: 25,
    category: "Palitos Cocteleros",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760338836/jamon_coctelero_oms3xe.png"
    ],
    averageRating: 4.3,
    totalReviews: 89,
  },
  {
    name: "Palito Coctelero de Puro Queso",
    description:
      "Versión coctelera del palito relleno de queso mozzarella, pequeño y perfecto para picar.",
    price: 1000,
    stock: 60,
    category: "Palitos Cocteleros",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760339152/mozzarella_coctelero_k0sewf.png"
    ],
    averageRating: 4.6,
    totalReviews: 342,
  },
  {
    name: "Palito Coctelero de Bocadillo y Queso",
    description:
     "Versión coctelera del palito premium con relleno de queso mozzarella y un toque dulce de bocadillo.",
    price: 1000,
    stock: 100,
    category: "Palitos Cocteleros",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760337851/guayaba_coctelero_vsuocu.png"
    ],
    averageRating: 4.8,
    totalReviews: 1243,
  },
  {
    name: "Palito Coctelero de Chocolate y Queso",
    description:
      "Contraste único de queso mozzarella y chocolate semiamargo.",
    price: 1000,
    stock: 45,
    category: "Palitos Cocteleros",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760338066/chocolate_coctelero_mmooyi.png"
    ],
    averageRating: 4.4,
    totalReviews: 167,
  },
  {
    name: "Oblea",
    description:
      "Oblea tradicional con arequipe, crema de leche, queso rallado y un toque de mora.",
    price: 5000,
    stock: 40,
    category: "Dulces",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760342624/oblea_hpljme.png"
    ],
    averageRating: 4.2,
    totalReviews: 95,
  },
  {
    name: "Buñuelo",
    description:
     "Delicioso buñuelo tradicional colombiano, crujiente por fuera y suave por dentro.",
    price: 1000,
    stock: 75,
    category: "Especiales",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1769925024/products/urtcva5pufpktzxbpiqm.png"
    ],
    averageRating: 4.5,
    totalReviews: 203,
  },
  {
    name: "Plato de Natilla",
    description:
      "Porción de natilla casera tradicional.",
    price: 5000,
    stock: 30,
    category: "Especiales",
    images: [
     "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760344131/natilla_porcion_acsrs4.png"
    ],
    averageRating: 4.7,
    totalReviews: 421,
  },
  {
    name: "Bandeja Personal de Natilla",
    description:
      "Bandeja mediana de natilla. Rinde hasta 4 porciones.",
    price: 10000,
    stock: 55,
    category: "Especiales",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760379271/natilla_personal_c6kqco.png"
    ],
    averageRating: 4.6,
    totalReviews: 134,
  },
  {
    name: "Bandeja Familiar de Natilla",
    description:
      "Bandeja grande de natilla. Rinde hasta 8 porciones.",
    price: 40000,
    stock: 55,
    category: "Especiales",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760379857/natilla_familiar_zmfqts.png"
    ],
    averageRating: 4.6,
    totalReviews: 80,
  },
  {
    name: "Hojuela",
    description:
      "Crujiente hojuela, perfecta para combinar con buñuelo y natilla.",
    price: 1000,
    stock: 30,
    category: "Especiales",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760380532/hojuela_pn0axk.png"
    ],
    averageRating: 4.2,
    totalReviews: 67,
  },
  {
    name: "Panocha",
    description:
      "Delicioso combinado de palito de queso con albondigón, ideal para compartir y disfrutar en grande.",
    price: 6000,
    stock: 20,
    category: "Nuevos",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760381317/panocha_vdxwcn.png"
    ],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    name: "Palipapa",
    description:
      "Combinación especial de palito de queso y papa rellena, perfecta para los que quieren probar de todo.",
    price: 2000,
    stock: 25,
    category: "Nuevos",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760342008/palipapa_a7rleh.png"
    ],
    averageRating: 0,
    totalReviews: 0,
  },
  {
    name: "Paliplátano",
    description:
      "Crocante por fuera, queso maduro y bocadillo por dentro. La perfecta fusión entre un palito de queso y un aborrajado.",
    price: 1500,
    stock: 15,
    category: "Nuevos",
    images: [
      "https://res.cloudinary.com/diqoi03kk/image/upload/f_auto,q_auto,w_400/v1760342322/paliplatano_wkqq0e.png"
    ],
    averageRating: 0,
    totalReviews: 0,
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(ENV.DB_URL);
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await Product.deleteMany({}, { session });
      console.log("Cleared existing products");
      await Product.insertMany(products, { session });
      console.log(`Successfully seeded ${products.length} products`);
      await session.commitTransaction();
    } catch (txErr) {
      await session.abortTransaction();
      throw txErr;
    } finally {
      session.endSession();
    }

    const categories = [...new Set(products.map((p) => p.category))];
    console.log("\n Seeded Products Summary:");
    console.log(`Total Products: ${products.length}`);
    console.log(`Categories: ${categories.join(", ")}`);

    await mongoose.connection.close();
    console.log("\n Database seeding completed and connection closed");
    process.exit(0);
  } catch (error) {
    console.error(" Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();