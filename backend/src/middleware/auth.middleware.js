import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            const auth = req.auth();
            const clerkId = auth.userId;

            if (!clerkId) {
                return res.status(401).json({ 
                    message: "Unauthorized - Invalid token" 
                });
            }

            const user = await User.findOne({ clerkId });
            
            if (!user) {
                return res.status(404).json({ 
                    message: "User not found" 
                });
            }

            if (!user.isActive) {
                const adminEmail = ENV.ADMIN_EMAIL;
                return res.status(403).json({
                    code: "ACCOUNT_INACTIVE",
                    message: adminEmail
                        ? `Tu cuenta ha sido desactivada. Escríbenos a ${adminEmail} para recuperarla.`
                        : "Tu cuenta ha sido desactivada. Contacta a soporte para recuperarla.",
                });
            }

            req.user = user;
            req.clerkAuth = auth;
            
            next();
        } catch (error) {
            console.error("Error in protectRoute middleware:", error);
            return res.status(500).json({ 
                message: "Internal server error" 
            });
        }
    }
];

export const adminOnly = async (req, res, next) => {
    try {
        if (!req.user || !req.clerkAuth) {
            console.error("adminOnly: protectRoute no se ejecutó primero");
            return res.status(401).json({ 
                message: "Unauthorized - authentication required" 
            });
        }

        const userRole = req.clerkAuth.sessionClaims?.role;
        const userEmail = req.user.email;
        const isAdmin = userRole === 'admin';
        const isAdminByEmail = ENV.NODE_ENV === 'development' &&
                                ENV.ADMIN_EMAIL && 
                                ENV.ADMIN_EMAIL.split(',')
                                    .map(e => e.trim())
                                    .includes(userEmail);

        if (!isAdmin && !isAdminByEmail) {   
            return res.status(403).json({ 
                message: "Forbidden - admin access only",
                details: ENV.NODE_ENV === 'development' 
                    ? `Rol actual: ${userRole || 'ninguno'}` 
                    : undefined
            });
        }
        next();
    } catch (error) {
        console.error("Error in adminOnly middleware:", error);
        return res.status(500).json({ 
            message: "Internal server error" 
        });
    }
};

export const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.clerkAuth) {
                return res.status(401).json({ 
                    message: "Unauthorized - authentication required" 
                });
            }

            const userRole = req.clerkAuth.sessionClaims?.role;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({ 
                    message: "Forbidden - insufficient permissions"
                });
            }

            next();
        } catch (error) {
            console.error("Error in requireRole middleware:", error);
            return res.status(500).json({ 
                message: "Internal server error" 
            });
        }
    };
};