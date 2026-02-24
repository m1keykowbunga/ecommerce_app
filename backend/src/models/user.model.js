import mongoose from "mongoose";
const addressSchema = new mongoose.Schema(
    {
        label:{
            type: String,
            required: true,
        },
        fullName:{
            type: String,
            required: true,
        },
        streetAddress:{
            type: String,
            required: true,
        },
        city:{
            type: String,
            required: true,
        },
        phoneNumber:{
            type: String,
            required: true,
        },
        isDefault:{
            type: Boolean,
            default: false,
        }
    }
);
const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        name: {
            type: String,
            required: true,
        },
        imageUrl: {
            type: String,
            default: "",
        },
        clerkId: {
            type: String,
            unique: true,
            required: true,
        },
        stripeCustomerId: {
            type: String,
            default: ""
        },
        addresses: [addressSchema],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
        ],
        emailNotifications: {           
            type: Boolean,
            default: true
        },
        marketingEmails: {
            type: Boolean,
            default: false
        },
        isActive: {       
            type: Boolean,
            default: true,
        },
        documentType: {
            type: String,
            enum: ["cedula_ciudadania", "cedula_extranjeria", "pasaporte"],
            default: null,
        },
        documentNumber: {
            type: String,
            default: "",
            trim: true,
        },
        gender: {
            type: String,
            enum: ["masculino", "femenino", "otro"],
            default: null,
        },
        dateOfBirth: {
            type: Date,
            default: null,
        }    
    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User", userSchema);