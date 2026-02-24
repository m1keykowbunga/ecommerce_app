import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { sendOrderCreatedAdminEmail, sendOrderCreatedClientEmail } from "../services/email.service.js";

export async function createOrder(req, res) {
    try {
        const user = req.user;
        const { orderItems, shippingAddress, paymentResult, totalPrice, discount } = req.body;

        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ error: "No order items" });
        }

        for (const item of orderItems) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.name} not found` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
            }
        }

        const order = await Order.create({
            user: user._id,
            clerkId: user.clerkId,
            orderItems,
            shippingAddress,
            paymentResult,
            totalPrice,
            discount: discount || 0,
        });

        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity },
            });
        }

        try {
            const emailData = {
                orderId: order._id.toString(),
                userName: user.name,
                userEmail: user.email,
                total: totalPrice,
                discount: discount || 0,
                items: orderItems.map((item) => ({
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
            ]).then((results) => {
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") {
                        const emailType = index === 0 ? "Admin" : "Cliente";
                        console.log(`Email de nuevo pedido enviado a ${emailType}`);
                    } else {
                        console.error("Error enviando email de nuevo pedido:", result.reason);
                    }
                });
            });
        } catch (emailError) {
            console.error("Error en proceso de emails:", emailError.message);
        }

        return res.status(201).json({ message: "Order created successfully", order });
    } catch (error) {
        console.error("Error in createOrder controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getUserOrders(req, res) {
    try {
        const orders = await Order.find({ clerkId: req.user.clerkId }).populate("orderItems.product", "name images price").sort({ createdAt: -1 });

        const orderIds = orders.map((order) => order._id);
        const reviews = await Review.find({ orderId: { $in: orderIds } });
        const reviewedOrderIds = new Set(reviews.map((review) => review.orderId.toString()));

        const ordersWithReviewStatus = orders.map((order) => {
            const orderObj = order.toObject();
            
            const orderItemsWithNames = orderObj.orderItems.map(item => ({
                _id: item._id,
                product: item.product,
                name: item.name || item.product?.name || 'Producto no disponible',
                price: item.price,
                quantity: item.quantity
            }));

            return {
                ...orderObj,
                orderItems: orderItemsWithNames,
                hasReviewed: reviewedOrderIds.has(order._id.toString()),
            };
        });

        return res.status(200).json({ orders: ordersWithReviewStatus });
    } catch (error) {
        console.error("Error in getUserOrders controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}