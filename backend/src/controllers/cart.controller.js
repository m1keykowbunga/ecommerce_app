import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js"; // IMPORTANTE: Asegúrate de importar tu modelo de Usuario
import mongoose from "mongoose";

// --- HELPERS INTERNOS ---

const getPopulatedCart = async (clerkId) => {
    return await Cart.findOne({ clerkId }).populate("items.product");
};

const getClerkId = (req) => {
    // Extraemos de forma segura el userId de la sesión de Clerk
    return req.auth?.userId; 
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// --- CONTROLADORES ---

export const getCart = async (req, res) => {
    try {
        const clerkId = getClerkId(req);
        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        const cart = await getPopulatedCart(clerkId);
        
        if (!cart) {
            return res.status(200).json({ cart: { items: [] } });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        console.error("❌ Error in getCart:", error);
        res.status(500).json({ error: "Error al obtener el carrito" });
    }
};

export async function addToCart(req, res) {
    try {
        console.log("------- DEBUG CARRITO -------");
        const { productId, quantity = 1 } = req.body;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        // 1. Validaciones iniciales
        if (!isValidId(productId)) {
            return res.status(400).json({ error: `ID de producto inválido: ${productId}` });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ error: "Producto no encontrado" });

        if (product.stock < quantity) {
            return res.status(400).json({ error: "Stock insuficiente" });
        }

        // 2. Buscar o crear el carrito
        let cart = await Cart.findOne({ clerkId });

        if (!cart) {
            // BUSCAMOS al usuario en MongoDB para obtener su _id
            const localUser = await User.findOne({ clerkId });
            
            if (!localUser) {
                console.error(`⚠️ Usuario ${clerkId} no encontrado en la DB local.`);
                return res.status(404).json({ error: "Usuario no sincronizado. Intenta re-loguear." });
            }

            cart = await Cart.create({
                user: localUser._id, // Ahora sí tenemos el ObjectId obligatorio
                clerkId: clerkId,
                items: [],
            });
        }

        // 3. Manejo de items
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
        console.error("❌ Error in addToCart:", error);
        return res.status(500).json({ error: error.message || "Internal server error" });
    }
}

export async function updateCartItem(req, res) {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });
        if (quantity < 1) return res.status(400).json({ error: "La cantidad mínima es 1" });

        const cart = await Cart.findOne({ clerkId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex === -1) return res.status(404).json({ error: "Producto no está en el carrito" });

        const product = await Product.findById(productId);
        if (product && product.stock < quantity) {
            return res.status(400).json({ error: "Stock insuficiente en inventario" });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        const updatedCart = await getPopulatedCart(clerkId);
        return res.status(200).json({ cart: updatedCart });
    } catch (error) {
        console.error("❌ Error in updateCartItem:", error);
        return res.status(500).json({ error: "Error al actualizar cantidad" });
    }
}

export async function removeFromCart(req, res) {
    try {
        const { productId } = req.params;
        const clerkId = getClerkId(req);

        if (!clerkId) return res.status(401).json({ error: "No autorizado" });

        const cart = await Cart.findOne({ clerkId });
        if (!cart) return res.status(404).json({ error: "Carrito no encontrado" });

        cart.items = cart.items.filter(item => item.product.toString() !== productId);
        await cart.save();

        const updatedCart = await getPopulatedCart(clerkId);
        return res.status(200).json({ cart: updatedCart });
    } catch (error) {
        console.error("❌ Error in removeFromCart:", error);
        return res.status(500).json({ error: "Error al eliminar producto" });
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
        console.error("❌ Error in clearCart:", error);
        return res.status(500).json({ error: "Error al vaciar carrito" });
    }
};