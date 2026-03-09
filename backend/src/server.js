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
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import productRoutes from "./routes/product.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import "./services/email.service.js";

const app = express();
const __dirname = path.resolve();

// --- 1. CONFIGURACIÓN DE CORS (Híbrido Local/Render) ---
const corsOptions = {
  origin: function (origin, callback) {
    // Permitimos localhost, ngrok y cualquier subdominio de onrender.com
    if (!origin || origin.includes('localhost') || origin.includes('ngrok') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));

// Refuerzo de headers (Necesario para navegadores y proxies)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && (origin.includes('localhost') || origin.includes('ngrok') || origin.includes('onrender.com'))) {
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

// --- 3. WEBHOOK DE CLERK ---
app.post("/api/webhooks/clerk", async (req, res) => {
  const { data, type } = req.body;
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
      await User.findOneAndUpdate({ clerkId: id }, userData, { upsert: true, new: true });
    }
    if (type === "user.deleted") {
      await User.findOneAndDelete({ clerkId: data.id });
    }
    res.status(200).json({ success: true });
  } catch (error) {
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

// --- 5. SERVICIO DE ARCHIVOS ESTÁTICOS (Híbrido) ---
const isProd = process.env.NODE_ENV === 'production';

// En Render usamos ruta corta (cp -r), en Local usamos ruta larga
const webPath = isProd 
  ? path.join(__dirname, "web/dist") 
  : path.join(__dirname, "../web/dist");

const adminPath = isProd 
  ? path.join(__dirname, "admin/dist") 
  : path.join(__dirname, "../admin/dist");

app.use(express.static(webPath));
app.use("/admin", express.static(adminPath));

// Manejador SPA Admin
app.get("/admin/*", (req, res) => {
    res.sendFile(path.join(adminPath, "index.html"));
});

// Manejador SPA Web (Evita colisiones con API y Admin)
app.get(/^(?!\/api|\/admin).+/, (req, res) => {
    res.sendFile(path.join(webPath, "index.html"));
});

// --- 6. ARRANQUE ---
const startServer = async () => {
    try {
        await connectDB();
        const PORT = ENV.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 Servidor en puerto ${PORT}`);
          console.log(`📂 Web Path: ${webPath}`);
          console.log(`📂 Admin Path: ${adminPath}`);
        });
    } catch (error) {
        console.error("Fallo crítico:", error);
    }
};

startServer();