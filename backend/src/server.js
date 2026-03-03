import express from "express";
import path from "path";
import { clerkMiddleware } from '@clerk/express';
import { serve } from "inngest/express";
import cors from "cors";

import { functions, inngest } from "./config/inngest.js";
import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";

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

// --- En tu server.js ---

const corsOptions = {
  
  origin: function (origin, callback) {
    // Si no hay origen (Postman/Mobile) o es uno de los permitidos
    if (!origin) return callback(null, true);

    const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
    const isNgrok = origin.includes('ngrok-free.dev') || origin.includes('ngrok-free.app') || origin.includes('ngrok.io');
    const isExpo = origin.startsWith('exp://') || origin.includes('expo.io');

    if (isLocal || isNgrok || isExpo) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Esto es vital
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'clerk-session-id', 
    'ngrok-skip-browser-warning',
    'x-clerk-auth-token',
    'x-requested-with'
  ],
  optionsSuccessStatus: 200 
};

// 1. Aplica el middleware de CORS normal
app.use(cors(corsOptions));

// 2. NUEVO: Middleware forzado para asegurar Credentials y Headers de Ngrok
// Pon esto JUSTO DEBAJO de app.use(cors(corsOptions))
app.use((req, res, next) => {
  const origin = req.headers.origin;
  // Si el origen está en nuestra lista blanca (podemos simplificar aquí para testeo)
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, clerk-session-id, ngrok-skip-browser-warning, x-clerk-auth-token, x-requested-with");
  
  // Manejo manual de pre-flight (OPTIONS) para evitar el error de PathError anterior
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


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

app.post("/api/webhooks/clerk", async (req, res) => {
  const event = req.body;
  console.log("Webhook received:", event.type);
  try {
    await inngest.send({
      name: `clerk.${event.type}`,
      data: event.data,
    });
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error sending event to Inngest:", error);
    res.status(500).json({ error: "Inngest error" });
  }
});

app.use("/api/inngest", serve({client:inngest, functions}));
app.use(clerkMiddleware());

app.get("/", (req, res) => {
  res.json({ 
    message: "API funcionando correctamente",
    status: "ok",
    endpoints: ["/api/health", "/api/products", "/api/cart"]
  });
});

app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);


app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Success" });
});

if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../admin/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../admin", "dist", "index.html"));
    });
}

const startServer = async () => {
    await connectDB();
    const HOST = '0.0.0.0';
    const PORT = ENV.PORT || 3000;
    app.listen(PORT, HOST, () => {
      console.log('🚀 Server is up and running!');
      console.log(`💻 Local:        http://localhost:${PORT}`);
      console.log(`📱 Network:      http://192.168.40.137:${PORT}`);
      console.log(`🌍 Environment:  ${ENV.NODE_ENV || 'development'}`);
    });
};

startServer();