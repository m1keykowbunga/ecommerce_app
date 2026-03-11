import { Resend } from "resend";
import { ENV } from "../config/env.js";

// Inicializamos Resend en lugar de Nodemailer
const resend = new Resend(ENV.RESEND_API_KEY);

const SHIPPING_COST = 10000;

// --- Helpers de Plantillas (Se mantienen exactamente igual para no romper nada) ---

const buildEmail = (bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8;">
                <tr><td style="padding:20px 32px;border-bottom:1px solid #eeeeee;"><img src="${ENV.LOGO_URL}" alt="${ENV.APP_NAME}" height="64" style="display:block;"></td></tr>
                <tr><td style="padding:32px;">${bodyContent}</td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;background-color:#fafafa;">
                    <p style="margin:0;font-size:12px;color:#aaaaaa;line-height:1.8;">© ${new Date().getFullYear()} Don Palito Jr. Todos los derechos reservados.</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

const buildEmailWithOrderRef = (orderId, bodyContent) => `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:32px 16px;">
        <tr><td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:6px;overflow:hidden;border:1px solid #e8e8e8;">
                <tr><td style="padding:20px 32px;border-bottom:1px solid #eeeeee;">
                    <table width="100%"><tr>
                        <td><img src="${ENV.LOGO_URL}" alt="${ENV.APP_NAME}" height="64"></td>
                        <td style="text-align:right;font-size:13px;color:#888888;">PEDIDO #${orderId}</td>
                    </tr></table>
                </td></tr>
                <tr><td style="padding:32px;">${bodyContent}</td></tr>
                <tr><td style="padding:20px 32px;border-top:1px solid #eeeeee;text-align:center;background-color:#fafafa;">
                    <p style="margin:0;font-size:12px;color:#aaaaaa;">Este correo es automático. Por favor no respondas.</p>
                </td></tr>
            </table>
        </td></tr>
    </table>
</body>
</html>`;

const divider = () => `<hr style="border:none;border-top:1px solid #eeeeee;margin:24px 0;">`;
const sectionTitle = (text) => `<p style="margin:0 0 16px;font-size:15px;font-weight:700;color:#222222;">${text}</p>`;

const buildOrderItems = (items) => `
<table width="100%" cellpadding="0" cellspacing="0">
    ${items.map(item => `
    <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;">${item.name || 'Producto'} × ${item.quantity}</td>
        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:600;text-align:right;">$${(item.price * item.quantity).toLocaleString('es-CO')}</td>
    </tr>`).join('')}
</table>`;

const buildTotals = (total, discount = 0) => {
    const subtotal = total - SHIPPING_COST + discount;
    return `
<table width="100%" style="margin-top:4px;">
    <tr><td style="font-size:14px;color:#555;">Subtotal</td><td style="text-align:right;">$${subtotal.toLocaleString('es-CO')}</td></tr>
    <tr><td style="font-size:14px;color:#555;">Envío</td><td style="text-align:right;">$${SHIPPING_COST.toLocaleString('es-CO')}</td></tr>
    ${discount > 0 ? `<tr><td style="font-size:14px;color:#555;">Descuento</td><td style="text-align:right;color:#C34928;">-$${discount.toLocaleString('es-CO')}</td></tr>` : ''}
    <tr><td style="padding-top:10px;font-weight:700;border-top:1px solid #ddd;">Total</td><td style="padding-top:10px;font-size:20px;font-weight:700;text-align:right;border-top:1px solid #ddd;">$${total.toLocaleString('es-CO')} COP</td></tr>
</table>`;
};

const buildAddressColumns = (shippingAddress, billingAddress) => `
<table width="100%">
    <tr>
        <td width="50%" style="vertical-align:top;">
            <p style="font-weight:700;font-size:13px;">Envío</p>
            <p style="font-size:13px;color:#555;">${shippingAddress.fullName}<br>${shippingAddress.streetAddress}<br>${shippingAddress.city}</p>
        </td>
        <td width="50%" style="vertical-align:top;border-left:1px solid #eee;padding-left:20px;">
            <p style="font-weight:700;font-size:13px;">Facturación</p>
            <p style="font-size:13px;color:#555;">${(billingAddress || shippingAddress).fullName}<br>${(billingAddress || shippingAddress).streetAddress}</p>
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
`;

// --- NUEVA LÓGICA DE ENVÍO CON RESEND (VÍA HTTP API) ---

export const sendEmail = async ({ to, subject, html, attachments = [] }) => {
    try {
        // Resend usa un formato de adjuntos ligeramente distinto (content debe ser string base64 o buffer)
        const formattedAttachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content
        }));

        const { data, error } = await resend.emails.send({
            from: `${ENV.APP_NAME} <onboarding@resend.dev>`, // Cambiar a tu dominio verificado cuando lo tengas
            to: [to],
            subject: subject,
            html: html,
            attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined
        });

        if (error) {
            console.error(`❌ Error API Resend enviando a ${to}:`, error);
            return { success: false, error };
        }

        console.log(`✅ Email enviado vía Resend a ${to}. ID: ${data.id}`);
        return { success: true, id: data.id };
    } catch (err) {
        console.error(`❌ Fallo crítico en sendEmail (Resend):`, err.message);
        return { success: false, error: err.message };
    }
};

const fireAndForget = (promise) => {
    promise.catch(err => console.error("❌ Error en email de segundo plano (Resend):", err.message));
};

// --- Mantenemos todas tus funciones de negocio (se usan exactamente igual) ---

export const sendWelcomeEmail = async ({ userName, userEmail }) => {
    const html = buildEmail(`<h2 style="color:#222;">¡Hola ${userName}!</h2><p>Tu cuenta ha sido creada con éxito.</p>`);
    fireAndForget(sendEmail({ to: userEmail, subject: `¡Bienvenido/a a ${ENV.APP_NAME}!`, html }));
    return { success: true };
};

export const sendOrderCreatedAdminEmail = async (orderData) => {
    const orderId = (orderData.orderId || '').slice(-8).toUpperCase();
    const html = buildEmailWithOrderRef(orderId, `<h2>Nuevo Pedido</h2>${buildFullOrderDetail(orderData)}`);
    fireAndForget(sendEmail({ to: ENV.ADMIN_EMAIL, subject: `Nuevo pedido #${orderId}`, html }));
};

export const sendOrderCreatedClientEmail = async (orderData) => {
    if (!orderData.emailNotifications) return;
    const orderId = orderData.orderId.slice(-8).toUpperCase();
    const html = buildEmailWithOrderRef(orderId, `<h2>¡Gracias por tu compra!</h2>${buildFullOrderDetail(orderData)}`);
    fireAndForget(sendEmail({ to: orderData.userEmail, subject: `Pedido recibido #${orderId}`, html }));
};

export const sendInvoiceEmails = async (data) => {
    const { userEmail, orderId, invoiceNumber, pdfBuffer, csvContent, emailNotifications } = data;
    const orderIdShort = orderId.toString().slice(-8).toUpperCase();

    const runAsync = async () => {
        if (emailNotifications) {
            await sendEmail({
                to: userEmail,
                subject: `Factura Pedido #${orderIdShort}`,
                html: buildEmailWithOrderRef(orderIdShort, `<p>Adjunto encontrarás tu factura ${invoiceNumber}.</p>`),
                attachments: [{ filename: `${invoiceNumber}.pdf`, content: pdfBuffer }],
            });
        }
        await sendEmail({
            to: ENV.ADMIN_EMAIL,
            subject: `Pago Confirmado #${orderIdShort}`,
            html: buildEmailWithOrderRef(orderIdShort, `<p>Factura generada: ${invoiceNumber}</p>`),
            attachments: [
                { filename: `${invoiceNumber}.pdf`, content: pdfBuffer },
                { filename: `${invoiceNumber}.csv`, content: Buffer.from(csvContent, "utf-8") }
            ],
        });
    };
    fireAndForget(runAsync());
    return { success: true };
};



// --- FUNCIONES FALTANTES PARA EL ADMIN CONTROLLER ---

export const sendOrderUpdatedAdminEmail = async (orderData) => {
    const orderId = (orderData.orderId || '').slice(-8).toUpperCase();
    const statusLabels = { paid: 'Pagado', delivered: 'Entregado' };
    
    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="color:#222222;">Pedido Actualizado</h2>
        <p><strong>Estado:</strong> ${statusLabels[orderData.status] || orderData.status}</p>
        ${buildFullOrderDetail(orderData)}
    `);

    fireAndForget(sendEmail({ to: ENV.ADMIN_EMAIL, subject: `Pedido #${orderId} actualizado`, html }));
};

export const sendOrderUpdatedClientEmail = async (orderData) => {
    if (!orderData.emailNotifications) return;
    const orderId = orderData.orderId.slice(-8).toUpperCase();
    
    const statusConfig = {
        paid: { title: '¡Pedido Confirmado!', message: 'Tu pago ha sido procesado exitosamente.' },
        delivered: { title: '¡Pedido Entregado!', message: '¡Esperamos que disfrutes tu compra!' },
    };

    const config = statusConfig[orderData.status] || statusConfig.paid;
    const html = buildEmailWithOrderRef(orderId, `
        <h2 style="color:#222222;">${config.title}</h2>
        <p>${config.message}</p>
        ${buildFullOrderDetail(orderData)}
    `);

    fireAndForget(sendEmail({ to: orderData.userEmail, subject: `${config.title} #${orderId}`, html }));
};

export const sendMarketingSubscriptionEmail = async ({ userName, userEmail }) => {
    const html = buildEmail(`<h2>¡Bienvenido al Boletín!</h2><p>Hola ${userName}, gracias por suscribirte.</p>`);
    
    fireAndForget(Promise.allSettled([
        sendEmail({ to: userEmail, subject: 'Suscripción exitosa', html }),
        sendEmail({ to: ENV.ADMIN_EMAIL, subject: 'Nuevo suscriptor', html: `<p>${userEmail} se ha suscrito.</p>` })
    ]));
};