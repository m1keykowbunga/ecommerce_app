import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import mongoose from "mongoose";

// --- HELPERS INTERNOS ---

// 1. Helper para obtener el carrito poblado
const getPopulatedCart = async (clerkId) => {
    return await Cart.findOne({ clerkId }).populate("items.product");
};

// 2. Helper para extraer el clerkId de forma segura (Resuelve el Deprecation Warning)
const getClerkId = (req) => {
    const authData = typeof req.auth === 'function' ? req.auth() : req.auth;
    return req.user?.clerkId || authData?.userId;
};

// 3. Helper para validar IDs de MongoDB
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- CONTROLADORES ---

export const getCart = async (req, res) => {
    try {
        const clerkId = getClerkId(req);
        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        const cart = await getPopulatedCart(clerkId);
        
        // Si no hay carrito, devolvemos estructura vacía (200 OK) para no bloquear el móvil
        if (!cart) {
            return res.status(200).json({ cart: { items: [] } });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        console.error("Error in getCart:", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
};

export async function addToCart(req, res) {
    try {
        const { productId, quantity = 1 } = req.body;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        if (!isValidId(productId)) {
            return res.status(400).json({ error: `ID de producto inválido: ${productId}` });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });

        if (product.stock < quantity) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        let cart = await Cart.findOne({ clerkId });

        if (!cart) {
            cart = await Cart.create({
                user: req.user?._id, // Viene del protectRoute si el usuario ya existe en Mongo
                clerkId: clerkId,
                items: [],
            });
        }

        const existingItem = cart.items.find((item) => item.product.toString() === productId);
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            if (product.stock < newQuantity) return res.status(400).json({ error: "Stock insuficiente" });
            existingItem.quantity = newQuantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        const updatedCart = await getPopulatedCart(clerkId);
        return res.status(200).json({ cart: updatedCart });
    } catch (error) {
        console.error("Error in addToCart:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateCartItem(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        if (quantity < 1) return res.status(400).json({ error: "La cantidad debe ser al menos 1" });
        if (!isValidId(productId)) return res.status(400).json({ error: "ID de producto inválido" });

        const cart = await Cart.findOne({ clerkId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Producto no está en el carrito" });

        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const updatedCart = await getPopulatedCart(clerkId);
        return res.status(200).json({ cart: updatedCart });
    } catch (error) {
        console.error("Error in updateCartItem:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        const cart = await Cart.findOne({ clerkId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.items = cart.items.filter((item) => item.product.toString() !== productId);
        await cart.save();

        const updatedCart = await getPopulatedCart(clerkId);
        return res.status(200).json({ cart: updatedCart });
    } catch (error) {
        console.error("Error in removeFromCart:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const clearCart = async (req, res) => {
    try {
        const clerkId = getClerkId(req);
        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        const cart = await Cart.findOne({ clerkId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.items = [];
        await cart.save();

        return res.status(200).json({ cart: { items: [] } });
    } catch (error) {
        console.error("Error in clearCart:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};