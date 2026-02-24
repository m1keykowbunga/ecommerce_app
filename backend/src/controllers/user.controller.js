import { User } from "../models/user.model.js";
import { sendMarketingSubscriptionEmail } from "../services/email.service.js";

export async function addAddress(req, res) {
    try {
        const { label, fullName, streetAddress, city, phoneNumber, isDefault } = req.body;

        const user = req.user;

        if (!label || !fullName || !streetAddress || !city || !phoneNumber) {
            return res.status(400).json({ error: "Missing required address fields" });
        }

        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        user.addresses.push({
            label,
            fullName,
            streetAddress,
            city,
            phoneNumber,
            isDefault: isDefault || false,
        });

        await user.save();

        return res.status(201).json({ message: "Address added successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in addAddress controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getAddresses(req, res) {
    try {
        const user = req.user;

        return res.status(200).json({ addresses: user.addresses });
    } catch (error) {
        console.error("Error in getAddresses controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateAddress(req, res) {
    try {
        const { label, fullName, streetAddress, city, phoneNumber, isDefault } = req.body;

        const { addressId } = req.params;

        const user = req.user;
        const address = user.addresses.id(addressId);
        if (!address) {
            return res.status(404).json({ error: "Address not found" });
        }

        if (isDefault) {
            user.addresses.forEach((addr) => {
                addr.isDefault = false;
            });
        }

        address.label = label || address.label;
        address.fullName = fullName || address.fullName;
        address.streetAddress = streetAddress || address.streetAddress;
        address.city = city || address.city;
        address.phoneNumber = phoneNumber || address.phoneNumber;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await user.save();

        return res.status(200).json({ message: "Address updated successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in updateAddress controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deleteAddress(req, res) {
    try {
        const { addressId } = req.params;
        const user = req.user;

        user.addresses.pull(addressId);
        await user.save();

        return res.status(200).json({ message: "Address deleted successfully", addresses: user.addresses });
    } catch (error) {
        console.error("Error in deleteAddress controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function addToWishlist(req, res) {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (user.wishlist.includes(productId)) {
            return res.status(400).json({ error: "Product already in wishlist" });
        }

        user.wishlist.push(productId);
        await user.save();

        return res.status(200).json({ message: "Product added to wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in addToWishlist controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function removeFromWishlist(req, res) {
    try {
        const { productId } = req.params;
        const user = req.user;

        if (!user.wishlist.includes(productId)) {
            return res.status(400).json({ error: "Product not found in wishlist" });
        }

        user.wishlist.pull(productId);
        await user.save();

        return res.status(200).json({ message: "Product removed from wishlist", wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in removeFromWishlist controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getWishlist(req, res) {
    try {
        const user = await User.findById(req.user._id).populate("wishlist");

        return res.status(200).json({ wishlist: user.wishlist });
    } catch (error) {
        console.error("Error in getWishlist controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateNotificationPreferences(req, res) {
    try {
        const { emailNotifications, marketingEmails } = req.body;

        const updateFields = {};
        if (emailNotifications !== undefined) updateFields.emailNotifications = emailNotifications;
        if (marketingEmails !== undefined) updateFields.marketingEmails = marketingEmails;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const justSubscribed = marketingEmails === true && req.user.marketingEmails === false;
        if (justSubscribed) {
            sendMarketingSubscriptionEmail({
                userName: user.name,
                userEmail: user.email,
            }).catch((err) =>
                console.error("Error enviando email de suscripción:", err.message)
            );
        }

        return res.status(200).json({
            message: "Notification preferences updated successfully",
            emailNotifications: user.emailNotifications,
            marketingEmails: user.marketingEmails,
        });
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function getProfile(req, res) {
    try {
        const user = req.user;
        return res.status(200).json({
            name: user.name,
            email: user.email,
            imageUrl: user.imageUrl,
            emailNotifications: user.emailNotifications,
            marketingEmails: user.marketingEmails,
            documentType: user.documentType,
            documentNumber: user.documentNumber,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
        });
    } catch (error) {
        console.error("Error in getProfile controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function deactivateAccount(req, res) {
    try {
        const user = req.user;

        await User.findByIdAndUpdate(user._id, { isActive: false });

        return res.status(200).json({ message: "Account deactivated successfully" });
    } catch (error) {
        console.error("Error in deactivateAccount controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export async function updateProfile(req, res) {
    try {
        const { documentType, documentNumber, gender, dateOfBirth } = req.body;

        const VALID_DOCUMENT_TYPES = ["cedula_ciudadania", "cedula_extranjeria", "pasaporte"];
        const VALID_GENDERS = ["masculino", "femenino", "otro"];

        if (documentType && !VALID_DOCUMENT_TYPES.includes(documentType)) {
            return res.status(400).json({ error: "Tipo de documento inválido" });
        }

        if (gender && !VALID_GENDERS.includes(gender)) {
            return res.status(400).json({ error: "Género inválido" });
        }

        if (dateOfBirth) {
            const parsed = new Date(dateOfBirth);
            if (isNaN(parsed.getTime())) {
                return res.status(400).json({ error: "Fecha de nacimiento inválida" });
            }
            if (parsed > new Date()) {
                return res.status(400).json({ error: "La fecha de nacimiento no puede ser futura" });
            }
        }

        const updateFields = {};
        if (documentType !== undefined) updateFields.documentType = documentType;
        if (documentNumber !== undefined) updateFields.documentNumber = documentNumber != null ? documentNumber.trim() : "";
        if (gender !== undefined) updateFields.gender = gender;
        if (dateOfBirth !== undefined) updateFields.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updateFields,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado" });
        }

        return res.status(200).json({
            message: "Perfil actualizado correctamente",
            documentType: user.documentType,
            documentNumber: user.documentNumber,
            gender: user.gender,
            dateOfBirth: user.dateOfBirth,
        });
    } catch (error) {
        console.error("Error in updateProfile controller:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}