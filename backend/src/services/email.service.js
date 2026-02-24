import nodemailer from "nodemailer";
import { ENV } from "../config/env.js";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: ENV.ADMIN_EMAIL,
        pass: ENV.EMAIL_PASSWORD,
    },
});

transporter.verify((error) => {
    if (error) {
        console.error("Error conectando al servidor de email:", error.message);
    } else {
        console.log("Servidor de email listo");
    }
});

const SHIPPING_COST = 10000;

const buildEmail = (bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8;">

                    <tr>
                        <td style="padding:20px 32px;border-bottom:1px solid #eeeeee;">
                            <img src="${ENV.LOGO_URL}" alt="${ENV.APP_NAME}" height="64" style="display:block;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            ${bodyContent}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;background-color:#fafafa;">
                            <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.8;">
                                Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.<br>
                                © ${new Date().getFullYear()} MigaTech. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const buildEmailWithOrderRef = (orderId, bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8;">

                    <!-- HEADER: LOGO IZQUIERDA + PEDIDO # DERECHA -->
                    <tr>
                        <td style="padding:20px 32px;border-bottom:1px solid #eeeeee;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <img src="${ENV.LOGO_URL}" alt="${ENV.APP_NAME}" height="64" style="display:block;">
                                    </td>
                                    <td style="text-align:right;font-size:13px;color:#888888;vertical-align:middle;">
                                        PEDIDO #${orderId}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:32px;">
                            ${bodyContent}
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;background-color:#fafafa;">
                            <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.8;">
                                Este correo fue enviado automáticamente. Por favor no respondas a este mensaje.<br>
                                © ${new Date().getFullYear()} MigaTech. Todos los derechos reservados.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const divider = () =>
    `<hr style="border:none;border-top:1px solid #eeeeee;margin:24px 0;">`;

const sectionTitle = (text) =>
    `<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#222222;">${text}</p>`;

const buildOrderItems = (items) => `
<table width="100%" cellpadding="0" cellspacing="0">
    ${items.map(item => `
    <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#333333;vertical-align:middle;">
            ${item.name || 'Producto'} × ${item.quantity}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:600;color:#222222;text-align:right;vertical-align:middle;white-space:nowrap;">
            $${(item.price * item.quantity).toLocaleString('es-CO')}
        </td>
    </tr>`).join('')}
</table>`;

const buildTotals = (total, discount = 0) => {
    const subtotal = total - SHIPPING_COST + discount;
    return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:4px;">
    <tr>
        <td style="padding:6px 0;font-size:14px;color:#555555;">Subtotal</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#222222;text-align:right;">$${subtotal.toLocaleString('es-CO')} COP</td>
    </tr>
    <tr>
        <td style="padding:6px 0;font-size:14px;color:#555555;">Envío</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:#222222;text-align:right;">$${SHIPPING_COST.toLocaleString('es-CO')} COP</td>
    </tr>
    <tr>
        <td style="padding:6px 0;font-size:14px;color:#555555;">Descuento</td>
        <td style="padding:6px 0;font-size:14px;font-weight:600;color:${discount > 0 ? '#C34928' : '#222222'};text-align:right;">${discount > 0 ? `-$${discount.toLocaleString('es-CO')} COP` : '-'}</td>
    </tr>
    <tr>
        <td style="padding:16px 0 4px;font-size:15px;color:#222222;border-top:1px solid #dddddd;">Total</td>
        <td style="padding:16px 0 4px;font-size:20px;font-weight:700;color:#222222;text-align:right;border-top:1px solid #dddddd;">$${total.toLocaleString('es-CO')} COP</td>
    </tr>
</table>`;
};

const buildAddressColumns = (shippingAddress, billingAddress) => `
<table width="100%" cellpadding="0" cellspacing="0">
    <tr>
        <td width="50%" style="vertical-align:top;padding-right:24px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#333333;">Dirección de envío</p>
            <p style="margin:0;font-size:13px;color:#555555;line-height:1.8;">
                ${shippingAddress.fullName}<br>
                ${shippingAddress.phoneNumber ? shippingAddress.phoneNumber + '<br>' : ''}
                ${shippingAddress.streetAddress}<br>
                ${shippingAddress.city}<br>
                Colombia
            </p>
        </td>
        <td width="50%" style="vertical-align:top;padding-left:24px;border-left:1px solid #eeeeee;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#333333;">Dirección de facturación</p>
            <p style="margin:0;font-size:13px;color:#555555;line-height:1.8;">
                ${(billingAddress || shippingAddress).fullName}<br>
                ${(billingAddress || shippingAddress).phoneNumber ? (billingAddress || shippingAddress).phoneNumber + '<br>' : ''}
                ${(billingAddress || shippingAddress).streetAddress}<br>
                ${(billingAddress || shippingAddress).city}<br>
                Colombia
            </p>
        </td>
    </tr>
</table>`;

const buildFullOrderDetail = (orderData) => `
    ${divider()}
    ${sectionTitle('Resumen del pedido')}
    ${buildOrderItems(orderData.items)}
    ${buildTotals(orderData.total, orderData.discount || 0)}

    ${divider()}
    ${sectionTitle('Información del cliente')}
    ${buildAddressColumns(orderData.shippingAddress, orderData.billingAddress)}

    ${orderData.paymentMethod ? `
    ${divider()}
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#333333;">Pago</p>
    <p style="margin:0;font-size:13px;color:#555555;">${orderData.paymentMethod}</p>` : ''}
`;

export const sendEmail = async ({ to, subject, html }) => {
    try {
        const info = await transporter.sendMail({
            from: `"${ENV.APP_NAME}" <${ENV.ADMIN_EMAIL}>`,
            to,
            subject,
            html,
        });
        console.log(`Email enviado a ${to}: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`Error enviando email a ${to}:`, error.message);
        return { success: false, error: error.message };
    }
};

export const sendWelcomeEmail = async ({ userName, userEmail }) => {
    const subject = `¡Bienvenido/a a ${ENV.APP_NAME}!`;

    const html = buildEmail(`
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">¡Bienvenido/a!</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#555555;line-height:1.7;">
            Tu cuenta ha sido creada exitosamente. Ya puedes empezar a explorar y realizar tus pedidos.
        </p>
        ${divider()}
        <p style="margin:0;font-size:13px;color:#aaaaaa;">Gracias por unirte a ${ENV.APP_NAME}.</p>
    `);

    const adminHtml = buildEmail(`
        <h2 style="margin:0 0 20px;font-size:20px;color:#222222;">Nuevo Usuario Registrado</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#888;width:120px;">Nombre</td><td style="font-size:14px;font-weight:600;color:#222;">${userName}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#888;">Email</td><td style="font-size:14px;color:#222;">${userEmail}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#888;">Fecha</td><td style="font-size:14px;color:#222;">${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
        </table>
    `);

    const clientEmail = sendEmail({ to: userEmail, subject, html });
    const adminEmail = sendEmail({ to: ENV.ADMIN_EMAIL, subject: `Nuevo usuario registrado - ${ENV.APP_NAME}`, html: adminHtml });
    return Promise.allSettled([clientEmail, adminEmail]);
};

export const sendOrderCreatedAdminEmail = async (orderData) => {
    const orderId = (orderData.orderId || '').slice(-8).toUpperCase();
    const subject = `Nuevo pedido #${orderId} - ${ENV.APP_NAME}`;

    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">Nuevo Pedido Recibido</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
            <tr><td style="padding:6px 0;font-size:14px;color:#888;width:100px;">Cliente</td><td style="font-size:14px;font-weight:600;color:#222;">${orderData.userName}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#888;">Email</td><td style="font-size:14px;color:#222;">${orderData.userEmail}</td></tr>
        </table>
        ${buildFullOrderDetail(orderData)}
    `);

    return sendEmail({ to: ENV.ADMIN_EMAIL, subject, html });
};

export const sendOrderCreatedClientEmail = async (orderData) => {
    if (!orderData.emailNotifications) return { success: true, skipped: true };

    const orderId = orderData.orderId.slice(-8).toUpperCase();
    const subject = `Pedido recibido #${orderId} - ${ENV.APP_NAME}`;

    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">¡Gracias por tu compra!</h2>
        <p style="margin:0 0 6px;font-size:14px;color:#555555;line-height:1.7;">
            Tu pedido ha sido recibido correctamente y lo estamos procesando.
        </p>
        ${buildFullOrderDetail(orderData)}
    `);

    return sendEmail({ to: orderData.userEmail, subject, html });
};

export const sendOrderUpdatedAdminEmail = async (orderData) => {
    const orderId = orderData.orderId.slice(-8).toUpperCase();
    const statusLabels = { paid: 'Pagado', delivered: 'Entregado' };
    const subject = `Pedido #${orderId} actualizado - ${ENV.APP_NAME}`;

    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">Pedido Actualizado</h2>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:4px;">
            <tr><td style="padding:6px 0;font-size:14px;color:#888;width:120px;">Nuevo estado</td><td style="font-size:14px;font-weight:600;color:#222;">${statusLabels[orderData.status] || orderData.status}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#888;">Cliente</td><td style="font-size:14px;color:#222;">${orderData.userName}</td></tr>
            <tr><td style="padding:6px 0;font-size:14px;color:#888;">Email</td><td style="font-size:14px;color:#222;">${orderData.userEmail}</td></tr>
        </table>
        ${buildFullOrderDetail(orderData)}
    `);

    return sendEmail({ to: ENV.ADMIN_EMAIL, subject, html });
};

export const sendOrderUpdatedClientEmail = async (orderData) => {
    if (!orderData.emailNotifications) return { success: true, skipped: true };

    const orderId = orderData.orderId.slice(-8).toUpperCase();
    const statusConfig = {
        paid: {
            title: '¡Pedido Confirmado!',
            message: 'Tu pago ha sido procesado exitosamente. Estamos preparando tu pedido.',
        },
        delivered: {
            title: '¡Pedido Entregado!',
            message: '¡Esperamos que disfrutes tu compra! Si tienes algún inconveniente, contáctanos.',
        },
    };

    const config = statusConfig[orderData.status] || statusConfig.paid;
    const subject = `${config.title} #${orderId} - ${ENV.APP_NAME}`;

    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">${config.title}</h2>
        <p style="margin:0 0 20px;font-size:14px;color:#555555;line-height:1.7;">
            ${config.message}
        </p>
        ${buildFullOrderDetail(orderData)}
    `);

    return sendEmail({ to: orderData.userEmail, subject, html });
};

export const sendMarketingSubscriptionEmail = async ({ userName, userEmail }) => {
    const subject = `¡Ya estás suscrito/a a nuestro boletín! - ${ENV.APP_NAME}`;

    const html = buildEmail(`
        <h2 style="margin:0 0 12px;font-size:22px;color:#222222;">¡Bienvenido/a al Boletín!</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#555555;line-height:1.7;">
            Te has suscrito exitosamente. A partir de ahora recibirás:
        </p>
        <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;color:#555555;line-height:2.2;">
            <li>Promociones exclusivas</li>
            <li>Novedades y nuevos productos</li>
            <li>Descuentos especiales para suscriptores</li>
        </ul>
        ${divider()}
        <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.7;">
            Si deseas cancelar tu suscripción, puedes hacerlo desde la sección 
            <strong>Privacidad &amp; Seguridad</strong> en la aplicación.
        </p>
    `);

    const adminHtml = buildEmail(`
        <h2 style="margin:0 0 20px;font-size:20px;color:#222222;">Nuevo Suscriptor al Boletín</h2>
        <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td style="padding:8px 0;font-size:14px;color:#888;width:120px;">Nombre</td><td style="font-size:14px;font-weight:600;color:#222;">${userName}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#888;">Email</td><td style="font-size:14px;color:#222;">${userEmail}</td></tr>
            <tr><td style="padding:8px 0;font-size:14px;color:#888;">Fecha</td><td style="font-size:14px;color:#222;">${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td></tr>
        </table>
    `);

    return Promise.allSettled([
        sendEmail({ to: userEmail, subject, html }),
        sendEmail({ to: ENV.ADMIN_EMAIL, subject: `Nuevo suscriptor al boletín - ${ENV.APP_NAME}`, html: adminHtml }),
    ]);
};