import { Coupon } from "../models/coupon.model.js";
import { Order } from "../models/order.model.js";

export const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;

        if (!code || !subtotal) {
            return res.status(400).json({ error: "El código y el subtotal son requeridos." });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase().trim() });

        if (!coupon) {
            return res.status(404).json({ error: "El cupón no existe o ya expiró." });
        }

        if (!coupon.isActive) {
            return res.status(400).json({ error: "El cupón no está activo." });
        }

        if (coupon.expiresAt && new Date() > coupon.expiresAt) {
            return res.status(400).json({ error: "El cupón ha expirado." });
        }

        const userId = req.user._id;
        const alreadyUsed = coupon.usedBy.some(
            (id) => id.toString() === userId.toString()
        );

        if (alreadyUsed) {
            return res.status(400).json({ error: "Ya usaste este cupón anteriormente." });
        }

        if (coupon.firstOrderOnly) {
            const orderCount = await Order.countDocuments({
                clerkId: req.user.clerkId,
                status: { $in: ["paid", "delivered", "in_preparation", "ready"] },
            });
            if (orderCount > 0) {
                return res.status(400).json({
                    error: "Este cupón es válido solo para tu primera compra.",
                });
            }
        }

        let discountAmount = 0;
        if (coupon.discountType === "percentage") {
            discountAmount = Math.min(
                Math.round((subtotal * coupon.discountValue) / 100),
                subtotal
            );
        } else {
            discountAmount = Math.min(coupon.discountValue, subtotal);
        }

        return res.status(200).json({
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
            },
            discountAmount,
        });
    } catch (error) {
        console.error("Error in validateCoupon:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        return res.status(200).json({ coupons });
    } catch (error) {
        console.error("Error in getCoupons:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const createCoupon = async (req, res) => {
    try {
        const { code, discountType, discountValue, expiresAt } = req.body;

        if (!code || !discountType || !discountValue) {
            return res.status(400).json({ error: "code, discountType y discountValue son requeridos." });
        }

        if (!["percentage", "fixed"].includes(discountType)) {
            return res.status(400).json({ error: "discountType debe ser 'percentage' o 'fixed'." });
        }

        if (discountType === "percentage" && (discountValue < 1 || discountValue > 100)) {
            return res.status(400).json({ error: "El porcentaje debe estar entre 1 y 100." });
        }

        const existing = await Coupon.findOne({ code: code.toUpperCase().trim() });
        if (existing) {
            return res.status(409).json({ error: "Ya existe un cupón con ese código." });
        }

        const coupon = await Coupon.create({
            code,
            discountType,
            discountValue,
            expiresAt: expiresAt || null,
        });

        return res.status(201).json({ coupon });
    } catch (error) {
        console.error("Error in createCoupon:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        if (updates.code) {
            updates.code = updates.code.toUpperCase().trim();
        }

        const discountType = updates.discountType;
        const discountValue = updates.discountValue;
        if (discountValue !== undefined) {
            const existingCoupon = discountType === undefined
                ? await Coupon.findById(id).select("discountType").lean()
                : null;
            const effectiveType = discountType ?? existingCoupon?.discountType;
            if (effectiveType === "percentage" && (discountValue < 1 || discountValue > 100)) {
                return res.status(400).json({ error: "El porcentaje debe estar entre 1 y 100." });
            }
        }

        const coupon = await Coupon.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!coupon) {
            return res.status(404).json({ error: "Cupón no encontrado." });
        }

        return res.status(200).json({ coupon });
    } catch (error) {
        console.error("Error in updateCoupon:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findByIdAndDelete(id);

        if (!coupon) {
            return res.status(404).json({ error: "Cupón no encontrado." });
        }

        return res.status(200).json({ message: "Cupón eliminado correctamente." });
    } catch (error) {
        console.error("Error in deleteCoupon:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getActiveCoupons = async (req, res) => {
    try {
        const now = new Date();
        const coupons = await Coupon.find({
            isActive: true,
            $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
        }).select("code discountType discountValue expiresAt firstOrderOnly").lean();

        const result = coupons.map((c) => ({
            code: c.code,
            discountType: c.discountType,
            discountValue: c.discountValue,
            firstOrderOnly: c.firstOrderOnly ?? false,
            expiresAt: c.expiresAt,
        }));

        return res.status(200).json({ coupons: result });
    } catch (error) {
        console.error("Error in getActiveCoupons:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};