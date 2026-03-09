import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express';
import cors from "cors";

import { User } from "./models/user.model.js"; 

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

// Rutas
import adminRoutes from "./routes/admin.routes.js";
import userRoutes from "./routes/user.routes.js";
import orderRoutes from "./routes/order.routes.js"
import reviewRoutes from "./routes/review.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js"
import couponRoutes from "./routes/coupon.routes.js";
import "./services/email.service.js";

const app = express();
const __dirname = path.resolve();

// --- 1. CONFIGURACIÓN DE CORS ---
const corsOptions = {
  origin: function (origin, callback) {
    // Permitimos localhost y tus túneles de ngrok
    if (!origin || origin.includes('localhost') || origin.includes('ngrok-free.dev') || origin.includes('ngrok-free.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

// Refuerzo manual de headers (Vital para Firefox y ngrok)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('ngrok-free.dev'))) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, clerk-session-id, ngrok-skip-browser-warning, x-clerk-auth-token, x-requested-with");

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// --- 2. MIDDLEWARES DE PARSEO ---
// Stripe Webhook requiere el body "raw"
app.use(
  "/api/payment",
  (req, res, next) => {
    if (req.originalUrl === "/api/payment/webhook") {
      express.raw({ type: "application/json" })(req, res, next);
    } else {
      express.json()(req, res, next);
    }
  },
  paymentRoutes
);

app.use(express.json());

// --- 3. WEBHOOK DE CLERK (REGISTRO DIRECTO A MONGODB) ---
// 🚀 Aquí eliminamos Inngest y guardamos directo en la DB
app.post("/api/webhooks/clerk", async (req, res) => {
  const { data, type } = req.body;
  
  console.log(`✉️ Webhook de Clerk recibido: ${type}`);

  try {
    if (type === "user.created" || type === "user.updated") {
      const { id, first_name, last_name, email_addresses, image_url } = data;
      const email = email_addresses[0]?.email_address;

      const userData = {
        clerkId: id,
        email: email,
        name: `${first_name || ""} ${last_name || ""}`.trim(),
        image: image_url,
      };

      // Si el usuario existe lo actualiza, si no, lo crea (Adiós usuarios fantasmas)
      await User.findOneAndUpdate(
        { clerkId: id },
        userData,
        { upsert: true, new: true }
      );

      console.log(`✅ Usuario ${id} sincronizado en MongoDB.`);
    }

    if (type === "user.deleted") {
      const { id } = data;
      await User.findOneAndDelete({ clerkId: id });
      console.log(`🗑️ Usuario ${id} eliminado.`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error en Webhook de Clerk:", error);
    res.status(500).json({ error: "Error interno" });
  }
});

app.use(clerkMiddleware());

// --- 4. RUTAS DE LA API ---
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "ok", message: "API Don Palito Junior operativa" });
});

// --- 5. SERVICIO DE ARCHIVOS ESTÁTICOS (WEB Y ADMIN) ---

// Ruta para la Web de Clientes
const webPath = path.join(__dirname, "../../web/dist"); 
app.use(express.static(webPath));

// Ruta para el Panel de Admin (Accesible en /admin)
const adminPath = path.join(__dirname, "../../admin/dist");
app.use("/admin", express.static(adminPath));

// MANEJADOR PARA EL ADMIN (Rutas internas de React Admin)
app.get("/admin/*", (req, res) => {
    res.sendFile(path.join(adminPath, "index.html"), (err) => {
        if (err) res.status(404).send("Admin dist no encontrado. Corre 'npm run build' en admin.");
    });
});

// MANEJADOR UNIVERSAL PARA LA WEB (Clientes)
app.get(/^(?!\/api|\/admin).+/, (req, res) => {
    res.sendFile(path.join(webPath, "index.html"), (err) => {
        if (err) res.status(404).send("Web dist no encontrado. Corre 'npm run build' en web.");
    });
});

// --- 6. ARRANQUE ---
const startServer = async () => {
    try {
        await connectDB();
        const PORT = ENV.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
          console.log('🚀 Backend de Don Palito Junior Protegido y Directo!');
          console.log(`📂 Sirviendo Front desde: ${frontendPath}`);
        });
    } catch (error) {
        console.error("Fallo crítico:", error);
    }
};

startServer();