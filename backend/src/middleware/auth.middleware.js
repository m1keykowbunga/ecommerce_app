import { requireAuth } from "@clerk/express";
import { User } from "../models/user.model.js";
import { ENV } from "../config/env.js";

export const protectRoute = [
    requireAuth(),
    async (req, res, next) => {
        try {
            // 1. COMPATIBILIDAD TOTAL: Detectamos si es función u objeto
            // Esto soluciona el Warning de deprecación y el error de undefined
            const auth = typeof req.auth === 'function' ? req.auth() : req.auth;
            const clerkId = auth?.userId;

            if (!clerkId) {
                console.log("❌ No se encontró clerkId. Auth status:", auth?.status);
                return res.status(401).json({ message: "Unauthorized - Invalid token" });
            }

            // 2. Buscamos el usuario en MongoDB
            const user = await User.findOne({ clerkId });
            
            if (!user) {
                console.log(`⚠️ Usuario con clerkId ${clerkId} no existe en MongoDB`);
                // Si estás en desarrollo, podrías querer redirigir a un registro
                return res.status(404).json({ message: "User not found in database" });
            }

            // 3. Inyectamos los datos para los controladores
            req.user = user;
            req.clerkAuth = auth; // Guardamos el objeto auth procesado
            
            next();
        } catch (error) {
            console.error("🔥 Error en protectRoute:", error);
            return res.status(500).json({ message: "Internal server error" });
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

        if (ENV.NODE_ENV === 'development') {
            console.log(`Admin check:`, {
                email: userEmail,
                role: userRole || 'sin role',
                clerkId: req.user.clerkId
            });
        }

        const isAdmin = userRole === 'admin';
        
        const isAdminByEmail = ENV.NODE_ENV === 'development' &&
                                ENV.ADMIN_EMAIL && 
                                ENV.ADMIN_EMAIL.split(',')
                                    .map(e => e.trim())
                                    .includes(userEmail);

        if (!isAdmin && !isAdminByEmail) {
            if (ENV.NODE_ENV === 'development') {
                console.log(`Acceso denegado:`, {
                    email: userEmail,
                    role: userRole || 'sin rol'
                });
            }        
            return res.status(403).json({ 
                message: "Forbidden - admin access only",
                details: ENV.NODE_ENV === 'development' 
                    ? `Rol actual: ${userRole || 'ninguno'}` 
                    : undefined
            });
        }

        if (ENV.NODE_ENV === 'development') {
            console.log(`Admin autorizado: ${userEmail} (${isAdmin ? 'por rol' : 'por email'})`);
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