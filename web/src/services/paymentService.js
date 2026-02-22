import api from './api';

export const paymentService = {
  /**
   * Crea un PaymentIntent en Stripe para el checkout.
   * @param {Array} cartItems - [{ product: id, quantity }]
   * @param {Object} shippingAddress - dirección de envío seleccionada
   */
  createPaymentIntent: async (cartItems, shippingAddress) => {
    const response = await api.post('/payment/create-intent', {
      cartItems,
      shippingAddress,
    });
    return response.data;
  },
};
