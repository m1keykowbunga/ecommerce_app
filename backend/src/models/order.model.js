import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    name: {
        type: String
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    }
});

const shippingAddressSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    clerkId: {
        type: String,
        required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
        type: shippingAddressSchema,
        required: true
    },
    paymentResult: {
        id: String,
        status: String,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ["pending", "paid", "delivered"],
        default: "pending"
    },
    paidAt: {
        type: Date,
    },
    deliveredAt: {
        type: Date,
    },
},
{
    timestamps: true
}
)

export const Order = mongoose.model("Order", orderSchema);