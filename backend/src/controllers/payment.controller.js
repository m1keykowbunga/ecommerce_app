import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Coupon } from "../models/coupon.model.js";
import { sendOrderCreatedAdminEmail, sendOrderCreatedClientEmail } from "../services/email.service.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

// --- HELPER PARA LIMPIAR EL CARRITO ---
const clearUserCart = async (userId) => {
    try {
        await User.findByIdAndUpdate(userId, { $set: { cartItems: [] } });
        console.log(`🛒 Carrito limpiado para el usuario: ${userId}`);
    } catch (error) {
        console.error("Error al limpiar el carrito:", error.message);
    }
};

export async function createPaymentIntent(req, res) {
    try {
        const { cartItems, shippingAddress, couponCode } = req.body;
        const user = req.user;

        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }
        if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.streetAddress) {
            return res.status(400).json({ error: "Shipping address is required" });
        }

        let subtotal = 0;
        const validatedItems = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.product.name} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }

            subtotal += product.price * item.quantity;
            validatedItems.push({
                product: product._id.toString(),
                price: product.price,
                quantity: item.quantity
            });
        }

        let discount = 0;
        let appliedCoupon = null;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
            const isValid = coupon && coupon.isActive && (!coupon.expiresAt || new Date() < coupon.expiresAt);

            if (!isValid) {
                return res.status(400).json({ error: "El cupón no es válido o ha expirado." });
            }

            const alreadyUsed = coupon.usedBy.some((id) => id.toString() === user._id.toString());
            if (alreadyUsed) {
                return res.status(400).json({ error: "Ya usaste este cupón anteriormente." });
            }
            
            discount = coupon.discountType === "percentage" 
                ? Math.round((subtotal * coupon.discountValue) / 100) 
                : Math.min(coupon.discountValue, subtotal);
            appliedCoupon = coupon;
        }

        const shipping = 10000;
        const total = subtotal + shipping - discount;

        const stripeAmount = Math.round(total * 100);
        
        let customer;
        if (user.stripeCustomerId) {
            try { customer = await stripe.customers.retrieve(user.stripeCustomerId); } catch (e) { customer = null; }
        }

        if (!customer) {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: { clerkId: user.clerkId, userId: user._id.toString() },
            });
            await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount,
            currency: "cop",
            customer: customer.id,
            automatic_payment_methods: { enabled: true },
            metadata: {
                clerkId: user.clerkId,
                userId: user._id.toString(),
                orderItems: JSON.stringify(validatedItems),
                shippingAddress: JSON.stringify(shippingAddress),
                couponCode: appliedCoupon ? appliedCoupon.code : "",
                discount: discount.toString(),
                totalPrice: total.toString(),
            },
        });

        res.status(200).json({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ error: "Failed to create payment intent" });
    }
}

export async function handleWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        try {
            const { userId, clerkId, orderItems, shippingAddress, couponCode, totalPrice, discount } = paymentIntent.metadata;

            const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });
            if (existingOrder) return res.json({ received: true });

            const items = JSON.parse(orderItems);
            const parsedShippingAddress = JSON.parse(shippingAddress);

            const enrichedOrderItems = [];
            for (const item of items) {
                const product = await Product.findById(item.product);
                enrichedOrderItems.push({
                    product: product?._id ?? item.product,
                    name: product?.name ?? "Producto no disponible",
                    price: item.price,
                    quantity: item.quantity,
                });
            }

            const order = await Order.create({
                user: userId,
                clerkId,
                orderItems: enrichedOrderItems,
                shippingAddress: parsedShippingAddress,
                paymentResult: { id: paymentIntent.id, status: "succeeded" },
                totalPrice,
                discount: parseFloat(discount) || 0,
            });

            // 1. LIMPIAR CARRITO (Webhooks de tarjeta)
            await clearUserCart(userId);

            // 2. ACTUALIZAR STOCK
            for (const item of items) {
                await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
            }

            // 3. CUPÓN
            if (couponCode) {
                await Coupon.findOneAndUpdate({ code: couponCode }, { $addToSet: { usedBy: userId } });
            }

            // 4. EMAILS
            const user = await User.findById(userId);
            if (user) {
                const emailData = {
                    orderId: order._id.toString(),
                    userName: user.name,
                    userEmail: user.email,
                    total: parseFloat(totalPrice),
                    items: enrichedOrderItems,
                    shippingAddress: parsedShippingAddress,
                };
                sendOrderCreatedAdminEmail(emailData);
                sendOrderCreatedClientEmail(emailData);
            }

            console.log("Order created and cart cleared via Stripe:", order._id);
        } catch (error) {
            console.error("Error processing webhook:", error);
        }
    }
    res.json({ received: true });
}

export async function createTransferOrder(req, res) {
    try {
        const { cartItems, shippingAddress, couponCode } = req.body;
        const user = req.user;

        // ... (Validaciones iniciales iguales)
        let subtotal = 0;
        const enrichedItems = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.product._id);
            if (!product || product.stock < item.quantity) {
                return res.status(400).json({ error: "Error en stock o producto" });
            }
            subtotal += product.price * item.quantity;
            enrichedItems.push({ product: product._id, name: product.name, price: product.price, quantity: item.quantity });
        }

        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
            if (coupon) {
                discount = coupon.discountType === "percentage" ? Math.round((subtotal * coupon.discountValue) / 100) : Math.min(coupon.discountValue, subtotal);
                await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase().trim() }, { $addToSet: { usedBy: user._id } });
            }
        }

        const total = subtotal + 10000 - discount;

        const order = await Order.create({
            user: user._id,
            clerkId: user.clerkId,
            orderItems: enrichedItems,
            shippingAddress,
            paymentResult: { id: `transfer_${Date.now()}`, status: "pending_transfer" },
            totalPrice: total,
            discount,
            status: "pending",
        });

        // --- LAS DOS LÍNEAS QUE FALTABAN ---
        await clearUserCart(user._id); // Limpia el carrito en la BD
        for (const item of enrichedItems) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }
        // -----------------------------------

        // Enviar Emails
        const emailData = { orderId: order._id.toString(), userName: user.name, userEmail: user.email, total, items: enrichedItems, shippingAddress };
        sendOrderCreatedAdminEmail(emailData);
        sendOrderCreatedClientEmail(emailData);

        return res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
}