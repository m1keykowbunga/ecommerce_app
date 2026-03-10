import api from './api';

export const paymentService = {
  /**
   * Crea una sesión de Stripe Checkout y redirige al usuario.
   * @param {Array} items - Los productos del carrito procesados.
   */
  createCheckoutSession: async (items) => {
    // 1. Llamamos a la nueva ruta unificada en el backend
    const response = await api.post('/payment/create-checkout-session', {
      items: items.map(item => ({
        id: item.product?._id || item.product?.id,
        name: item.product?.name,
        price: item.product?.discount 
          ? Math.round(item.product.price * (1 - item.product.discount / 100))
          : item.product?.price,
        quantity: item.quantity
      }))
    });

    // 2. Extraemos la URL que nos devuelve el backend
    const { url } = response.data;

    if (url) {
      // 3. Redirigimos al usuario fuera de la app hacia Stripe
      window.location.href = url;
    } else {
      throw new Error("No se pudo obtener la URL de pago");
    }
  },

  // Mantén el createPaymentIntent solo si lo usas en otra parte, 
  // pero para el flujo actual de Render no lo necesitas.
};