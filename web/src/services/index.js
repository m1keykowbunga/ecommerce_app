import api from './api';

// ============= PRODUCTOS =============
export const productService = {
  getProducts: async (params = {}) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getProductById: async (id) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

// ============= CARRITO =============
export const cartService = {
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId, quantity) => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data;
  },

  updateItem: async (productId, quantity) => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  removeItem: async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },
};

// ============= ÓRDENES =============
export const orderService = {
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  getOrderHistory: async (params = {}) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getOrderById: async (id) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

// ============= RESEÑAS =============
export const reviewService = {
  createReview: async (reviewData) => {
    const response = await api.post('/reviews', reviewData);
    return response.data;
  },

  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

// ============= CUPONES =============
export const couponService = {
  validate: async (code, subtotal) => {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data;
  },
  getActive: async () => {
    const response = await api.get('/coupons/active');
    return response.data;
  },
};

// ============= DIRECCIONES (/api/users/addresses) =============
export const addressService = {
  getAddresses: async () => {
    const response = await api.get('/users/addresses');
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await api.post('/users/addresses', addressData);
    return response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await api.put(`/users/addresses/${addressId}`, addressData);
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data;
  },
};

// ============= USUARIO — perfil extendido =============
export const userService = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },

  updateNotificationPreferences: async (prefs) => {
    const response = await api.put('/users/notification-preferences', prefs);
    return response.data;
  },

  deactivateAccount: async () => {
    const response = await api.patch('/users/deactivate');
    return response.data;
  },
};

// ============= WISHLIST (/api/users/wishlist) =============
export const wishlistService = {
  getWishlist: async () => {
    const response = await api.get('/users/wishlist');
    return response.data;
  },

  addToWishlist: async (productId) => {
    const response = await api.post('/users/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/users/wishlist/${productId}`);
    return response.data;
  },
};

// ============= PAGOS =============
export const paymentService = {
  createPaymentIntent: async (cartItems, shippingAddress, couponCode) => {
    const response = await api.post('/payment/create-intent', {
      cartItems,
      shippingAddress,
      couponCode,
    });
    return response.data;
  },

  createTransferOrder: async (cartItems, shippingAddress, couponCode) => {
    const response = await api.post('/payment/create-transfer-order', {
      cartItems,
      shippingAddress,
      couponCode,
    });
    return response.data;
  },
};
