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

const corsOptions = {
  origin: ENV.NODE_ENV === "production" 
    ? ENV.CLIENT_URL  
    : function (origin, callback) {
        if (!origin) {
          return callback(null, true);
        }
        
        const allowedOrigins = [
          'http://localhost:5173',           // Dashboard web
          'http://localhost:3000',           // Mismo servidor
          'http://localhost:8081',           // Expo metro bundler
          'http://127.0.0.1:5173',          // Alternativa localhost
          'http://10.0.2.2:3000',           // Emulador Android
          'http://10.0.2.2:8081',           // Expo en emulador
        ];
        
        if (origin.startsWith('exp://')) {
          return callback(null, true);
        }
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        callback(new Error('Not allowed by CORS'));
      },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'clerk-session-id']
};

app.use(cors(corsOptions));

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

app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/coupons", couponRoutes);

app.get("/api/health", (req, res) => {
    res.status(200).json({ message: "Success" });
});

// Make app ready for deployment
if (ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../admin/dist")));
    app.get("/{*any}", (req, res) => {
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
