import { formatCurrency } from './formatters';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '573148702078';

/**
 * Construye la URL de WhatsApp para confirmar un pedido.
 */
export const buildOrderWhatsAppURL = ({ orderId, items = [], total, paymentMethod }) => {
  const itemsList = items
    .map((item) => {
      const name = item.product?.name || item.name || 'Producto';
      const qty = item.quantity || 1;
      const price = item.unitPrice || item.product?.price || 0;
      return `  - ${name} x${qty}: ${formatCurrency(price * qty)}`;
    })
    .join('\n');

  const paymentLabel = {
    stripe: 'Tarjeta (Stripe)',
    transferencia: 'Transferencia bancaria',
  }[paymentMethod] || paymentMethod || 'Por definir';

  const message = [
    `*¡Hola Don Palito Jr! Quiero confirmar mi pedido* 🛍️`,
    ``,
    `*Pedido:* ${orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : 'Nuevo'}`,
    ``,
    `*Productos:*`,
    itemsList,
    ``,
    `*Total:* ${formatCurrency(total)}`,
    `*Método de pago:* ${paymentLabel}`,
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
