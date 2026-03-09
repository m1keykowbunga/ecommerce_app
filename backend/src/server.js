import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express';
import cors from "cors";
import Stripe from 'stripe';

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
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// --- 1. CONFIGURACIÓN DE CORS ---
const allowedOrigins = [
  'https://don-palito-jr.onrender.com', 
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || origin.includes('ngrok') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 
}));

// --- 2. MIDDLEWARE DE STRIPE WEBHOOK (DEBE IR ANTES DE EXPRESS.JSON) ---
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

// Middleware general para el resto de rutas
app.use(express.json());

// --- 3. ENDPOINT DE STRIPE CHECKOUT // Endpoint unificado bajo /api/payment
app.post('/api/payment/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;
        
        // Detectamos la URL base automáticamente (funciona en local y en Render)
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: items.map(item => ({
                price_data: {
                    currency: 'cop', 
                    product_data: {
                        name: item.name || item.nombre,
                    },
                    unit_amount: Math.round((item.price || item.precio) * 100),
                },
                quantity: item.quantity || item.cantidad,
            })),
            mode: 'payment',
            // Redirigimos dinámicamente según dónde esté corriendo el servidor
            success_url: `${baseUrl}/success`,
            cancel_url: `${baseUrl}/carrito`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("❌ Error en Stripe:", error);
        res.status(500).json({ error: "No se pudo crear la sesión de pago" });
    }
});

// --- 4. WEBHOOK DE CLERK ---
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

// Clerk Middleware (Después de Webhooks para evitar conflictos de firmas)
app.use(clerkMiddleware());

// --- 5. RUTAS DE LA API ---
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

// --- 6. SERVICIO DE ARCHIVOS ESTÁTICOS ---
const webPath = path.join(__dirname, "web/dist");
const adminPath = path.join(__dirname, "admin/dist");

app.use(express.static(webPath));
app.use("/admin", express.static(adminPath));

app.get(/^\/admin(\/.*)?$/, (req, res) => {
    res.sendFile(path.join(adminPath, "index.html"));
});

app.get(/^(?!\/(api|admin)).*$/, (req, res) => {
    res.sendFile(path.join(webPath, "index.html"));
});

// --- 7. ARRANQUE ---
const startServer = async () => {
    try {
        await connectDB();
        const PORT = ENV.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
          console.log(`🚀 Servidor en puerto ${PORT}`);
        });
    } catch (error) {
        console.error("Fallo crítico:", error);
    }
};

startServer();