import dotenv from "dotenv";

dotenv.config({quiet: true});

export const ENV = {
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    DB_URL: process.env.DB_URL,
    CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    CLERK_WEBHOOK_SECRET: process.env.CLERK_WEBHOOK_SECRET,
    INNGEST_SIGNING_KEY: process.env.INNGEST_SIGNING_KEY,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    APP_NAME: process.env.APP_NAME,
    LOGO_URL: process.env.LOGO_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
}