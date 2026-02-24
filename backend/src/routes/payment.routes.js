import { Router } from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createPaymentIntent, handleWebhook, createTransferOrder } from "../controllers/payment.controller.js";

const router = Router();

router.post("/create-intent", protectRoute, createPaymentIntent);
router.post("/create-transfer-order", protectRoute, createTransferOrder);
router.post("/webhook", handleWebhook);

export default router;