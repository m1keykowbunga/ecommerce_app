import { Router } from "express";
import { protectRoute, adminOnly } from "../middleware/auth.middleware.js";
import { validateCoupon, createCoupon, getCoupons, updateCoupon, deleteCoupon, getActiveCoupons } from "../controllers/coupon.controller.js";

const router = Router();

router.get("/active", getActiveCoupons); // público — para el marquee del Home
router.post("/validate", protectRoute, validateCoupon);
router.get("/", protectRoute, adminOnly, getCoupons);
router.post("/", protectRoute, adminOnly, createCoupon);
router.patch("/:id", protectRoute, adminOnly, updateCoupon);
router.delete("/:id", protectRoute, adminOnly, deleteCoupon);

export default router;