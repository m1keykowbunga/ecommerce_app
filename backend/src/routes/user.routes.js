import { Router } from "express";
import { addAddress, deleteAddress, getAddresses, updateAddress, addToWishlist, getWishlist, removeFromWishlist, updateNotificationPreferences, getProfile, updateProfile, deactivateAccount } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protectRoute);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);

router.post("/addresses", addAddress);
router.get("/addresses", getAddresses);
router.put("/addresses/:addressId", updateAddress);
router.delete("/addresses/:addressId", deleteAddress);

router.post("/wishlist", addToWishlist);
router.get("/wishlist", getWishlist);
router.delete("/wishlist/:productId", removeFromWishlist);

router.put("/notification-preferences", updateNotificationPreferences);

router.patch("/deactivate", deactivateAccount);

export default router;