import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { Review } from "../models/review.model.js";
import { sendOrderCreatedAdminEmail, sendOrderCreatedClientEmail } from "../services/email.service.js";
import { generateInvoicePDF } from "../services/invoice.service.js";
import { ENV } from "../config/env.js";

export async function createOrder(req, res) {
    try {
        const user = req.user;
        const { orderItems, shippingAddress, paymentResult, totalPrice } = req.body;

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
        });

        for (const item of orderItems) {
            await Product.findByIdAndUpdate(item.product._id, {
                $inc: { stock: -item.quantity },
            });
        }

        const emailData = {
            orderId:       order._id.toString(),
            userEmail:     user.email,
            userName:      user.name,
            items:         orderItems.map(item => ({
                name:     item.name || "Producto",
                quantity: item.quantity,
                price:    item.price,
            })),
            total:          totalPrice,
            discount:       0,
            shippingAddress,
            emailNotifications: user.emailNotifications,
        };

        Promise.allSettled([
            sendOrderCreatedAdminEmail(emailData),
            sendOrderCreatedClientEmail(emailData),
        ]).then((results) => {
            results.forEach((result, index) => {
                if (result.status === "fulfilled") {
                    console.log(`Email de nuevo pedido enviado a ${index === 0 ? "Admin" : "Cliente"}`);
                } else {
                    console.error(`Error enviando email de pedido a ${index === 0 ? "Admin" : "Cliente"}:`, result.reason);
                }
            });
        });

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

export async function downloadInvoice(req, res) {
    try {
        const { orderId } = req.params;
        const user = req.user;

        const order = await Order.findById(orderId)
            .populate("orderItems.product", "name price images")
            .lean();

        if (!order) return res.status(404).json({ error: "Pedido no encontrado." });
        if (order.clerkId !== user.clerkId)
            return res.status(403).json({ error: "No autorizado." });
        if (order.status !== "paid" && order.status !== "delivered")
            return res.status(400).json({ error: "La factura solo está disponible para pedidos pagados o entregados." });

        const invoiceNumber = `FV-${new Date().getFullYear()}-${orderId.slice(-8).toUpperCase()}`;
        const paymentMethod = order.paymentResult?.id?.startsWith("pi_") ? "stripe" : "transferencia";
        const invoiceData = {
            orderId,
            date: new Date(order.paidAt || order.createdAt),
            paymentMethod,
            items: order.orderItems.map((item) => ({
                name: item.name || item.product?.name || "Producto",
                quantity: item.quantity,
                price: item.price,
            })),
            shipping: 0,
            discount: 0,
            customer: {
                name: order.shippingAddress?.fullName || user.name,
                documentType: user.documentType || "cedula",
                documentNumber: user.documentNumber || "",
                email: user.email,
                phone: order.shippingAddress?.phoneNumber || user.phone || "",
                address: order.shippingAddress?.streetAddress || "",
                city: order.shippingAddress?.city || "",
            },
        };

        const pdfBuffer = await generateInvoicePDF(invoiceData);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="factura-${invoiceNumber}.pdf"`,
            "Content-Length": pdfBuffer.length,
        });
        return res.send(pdfBuffer);
    } catch (error) {
        console.error("Error in downloadInvoice:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}