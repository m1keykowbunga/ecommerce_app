// migrate-images.js
import mongoose from "mongoose";
import { Product } from "../models/product.model.js";
import { ENV } from "../config/env.js";

const migrateImages = async () => {
  await mongoose.connect(ENV.DB_URL);

  const products = await Product.find({});

  for (const product of products) {
    const optimizedImages = product.images.map((url) =>
      url.replace(
        "/image/upload/",
        "/image/upload/f_auto,q_auto,w_400/"
      )
    );

    await Product.updateOne(
      { _id: product._id },
      { $set: { images: optimizedImages } }
    );

    console.log(`${product.name}`);
  }

  console.log("\nMigración completada");
  await mongoose.connection.close();
  process.exit(0);
};

migrateImages().catch((err) => {
  console.error("Error en migración:", err);
  process.exit(1);
});