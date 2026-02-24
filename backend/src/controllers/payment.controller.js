import Stripe from "stripe";
import { ENV } from "../config/env.js";
import { User } from "../models/user.model.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { Coupon } from "../models/coupon.model.js";
import { sendOrderCreatedAdminEmail, sendOrderCreatedClientEmail } from "../services/email.service.js";

const stripe = new Stripe(ENV.STRIPE_SECRET_KEY);

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

            const isValid =
                coupon &&
                coupon.isActive &&
                (!coupon.expiresAt || new Date() < coupon.expiresAt);

            if (!isValid) {
                return res.status(400).json({ error: "El cupón no es válido o ha expirado." });
            }

            const alreadyUsed = coupon.usedBy.some(
                (id) => id.toString() === user._id.toString()
            );
            if (alreadyUsed) {
                return res.status(400).json({ error: "Ya usaste este cupón anteriormente." });
            }
            
            if (coupon.discountType === "percentage") {
                discount = Math.round((subtotal * coupon.discountValue) / 100);
            } else {
                discount = Math.min(coupon.discountValue, subtotal);
            }

            appliedCoupon = coupon;
        }

        const shipping = 10000;
        const total = subtotal + shipping - discount;

        if (total <= 0) {
            return res.status(400).json({ error: "Invalid order total" });
        }

        const stripeAmount = Math.round(total * 100);

        const minAmountCOP = 2000;
        if (total < minAmountCOP) {
            console.error("Error: Amount is less than the minimum for Stripe");
            return res.status(400).json({
                error: `The minimum amount to process payments is $${minAmountCOP} COP`
            });
        }

        let customer;
        if (user.stripeCustomerId) {
            try {
                customer = await stripe.customers.retrieve(user.stripeCustomerId);
            } catch (error) {
                customer = null;
            }
        }

        if (!customer) {
            customer = await stripe.customers.create({
                email: user.email,
                name: user.name,
                metadata: {
                    clerkId: user.clerkId,
                    userId: user._id.toString(),
                },
            });

            await User.findByIdAndUpdate(user._id, { stripeCustomerId: customer.id });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: stripeAmount,
            currency: "cop",
            customer: customer.id,
            automatic_payment_methods: {
                enabled: true,
            },
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

        res.status(200).json({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id
        });
    } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({
            error: "Failed to create payment intent",
            details: ENV.NODE_ENV === "development" ? error.message : undefined
        });
    }
}

export async function handleWebhook(req, res) {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, ENV.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;

        try {
            const { userId, clerkId, orderItems, shippingAddress, couponCode, totalPrice, discount } = paymentIntent.metadata;

            const existingOrder = await Order.findOne({ "paymentResult.id": paymentIntent.id });

            if (existingOrder) {
                console.log("Order already exists for payment:", paymentIntent.id);
                return res.json({ received: true });
            }

            const items = JSON.parse(orderItems);
            const parsedShippingAddress = JSON.parse(shippingAddress);
            const parsedDiscount = parseFloat(discount) || 0;

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
                paymentResult: {
                    id: paymentIntent.id,
                    status: "succeeded",
                },
                totalPrice,
                discount: parsedDiscount,
            });

            try {
                const user = await User.findById(userId);

                if (user) {
                    const emailData = {
                        orderId: order._id.toString(),
                        userName: user.name,
                        userEmail: user.email,
                        total: parseFloat(totalPrice),
                        discount: parsedDiscount, 
                        items: enrichedOrderItems.map((item) => ({
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                        })),
                        shippingAddress: parsedShippingAddress,
                        emailNotifications: user.emailNotifications,
                    };

                    Promise.allSettled([
                        sendOrderCreatedAdminEmail(emailData),
                        sendOrderCreatedClientEmail(emailData),
                    ]).then((results) => {
                        results.forEach((result, index) => {
                            if (result.status === "fulfilled") {
                                const emailType = index === 0 ? "Admin" : "Cliente";
                                console.log(`Email de nuevo pedido enviado a ${emailType}`);
                            } else {
                                console.error("Error enviando email:", result.reason);
                            }
                        });
                    });
                }
            } catch (emailError) {
                console.error("Error en proceso de emails:", emailError.message);
            }

            for (const item of items) {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { stock: -item.quantity },
                });
            }

            if (couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: couponCode },
                    { $addToSet: { usedBy: userId } } 
                );
            }

            console.log("Order created successfully:", order._id);
        } catch (error) {
            console.error("Error processing webhook:", error);
            return res.status(500).json({ error: "Webhook processing failed" });
        }
    }

    res.json({ received: true });
}

export async function createTransferOrder(req, res) {
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
        const enrichedItems = [];

        for (const item of cartItems) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ error: `Producto no encontrado` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Stock insuficiente para ${product.name}` });
            }

            subtotal += product.price * item.quantity;
            enrichedItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity,
            });
        }

        let discount = 0;
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase().trim() });
            const isValid = coupon && coupon.isActive && (!coupon.expiresAt || new Date() < coupon.expiresAt);

            if (!isValid) {
                return res.status(400).json({ error: "El cupón no es válido o ha expirado." });
            }

            const alreadyUsed = coupon.usedBy.some(id => id.toString() === user._id.toString());
            if (alreadyUsed) {
                return res.status(400).json({ error: "Ya usaste este cupón anteriormente." });
            }

            discount = coupon.discountType === "percentage"
                ? Math.round((subtotal * coupon.discountValue) / 100)
                : Math.min(coupon.discountValue, subtotal);

            await Coupon.findOneAndUpdate(
                { code: couponCode.toUpperCase().trim() },
                { $addToSet: { usedBy: user._id } }
            );
        }

        const shipping = 10000;
        const total = subtotal + shipping - discount;

        if (total <= 0) {
            return res.status(400).json({ error: "Invalid order total" });
        }

        const order = await Order.create({
            user: user._id,
            clerkId: user.clerkId,
            orderItems: enrichedItems,
            shippingAddress,
            paymentResult: {
                id: `transfer_${Date.now()}`,
                status: "pending_transfer",
            },
            totalPrice: total,
            discount,
            status: "pending",
        });

        for (const item of enrichedItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity },
            });
        }

        try {
            const emailData = {
                orderId: order._id.toString(),
                userName: user.name,
                userEmail: user.email,
                total,
                discount,
                items: enrichedItems.map(item => ({
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress,
                emailNotifications: user.emailNotifications,
            };

            Promise.allSettled([
                sendOrderCreatedAdminEmail(emailData),
                sendOrderCreatedClientEmail(emailData),
            ]).then(results => {
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        console.log(`Email transferencia enviado a ${index === 0 ? "Admin" : "Cliente"}`);
                    } else {
                        console.error("Error enviando email:", result.reason);
                    }
                });
            });
        } catch (emailError) {
            console.error("Error en emails de transferencia:", emailError.message);
        }

        return res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Error in createTransferOrder:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}