let orders = [];

export const orderServiceMock = {
  createOrder: (orderData) => {
    const newOrder = {
      id: `ORD-${String(orders.length + 1).padStart(3, '0')}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        { status: 'pending', date: new Date().toISOString() },
      ],
    };
    orders = [newOrder, ...orders];
    return newOrder;
  },

  getUserOrders: (userId) => {
    return orders.filter((o) => o.userId === userId);
  },

  getOrderById: (orderId) => {
    return orders.find((o) => o.id === orderId);
  },

  getAllOrders: () => {
    return orders;
  },

  updateOrderStatus: (orderId, newStatus) => {
    orders = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          updatedAt: new Date().toISOString(),
          timeline: [
            ...o.timeline,
            { status: newStatus, date: new Date().toISOString() },
          ],
        };
      }
      return o;
    });
    return orders.find((o) => o.id === orderId);
  },
};
