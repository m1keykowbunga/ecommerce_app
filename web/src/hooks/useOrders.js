import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { orderService } from '../services/index';
import { getProductId } from '../utils/productHelpers';

// Mock de pedidos para desarrollo sin backend
const mockOrders = [];

export const useOrders = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!isAuthenticated) return mockOrders;
      try {
        const data = await orderService.getOrderHistory();
        return Array.isArray(data) ? data : data.orders || mockOrders;
      } catch {
        return mockOrders;
      }
    },
    enabled: isAuthenticated,
  });
};

export const useCreateOrder = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData) => {
      const payload = {
        orderItems: (orderData.items || orderData.orderItems || []).map((item) => ({
          product: getProductId(item.product),
          name: item.product?.name || item.name || '',
          price: item.unitPrice || item.product?.price || item.price || 0,
          quantity: item.quantity,
          image:
            item.product?.images?.[0] ||
            item.product?.image ||
            item.image ||
            '',
        })),
        shippingAddress: orderData.address
          ? {
              fullName: orderData.address.fullName || '',
              streetAddress: orderData.address.streetAddress || '',
              city: orderData.address.city || '',
              state: orderData.address.state || '',
              postalCode: orderData.address.postalCode || '',
              country: orderData.address.country || 'Colombia',
              phoneNumber: orderData.address.phoneNumber || '',
            }
          : undefined,
        paymentResult: {
          status: orderData.paymentMethod || 'pending',
          method: orderData.paymentMethod || 'pending',
        },
        totalPrice: orderData.total || 0,
      };

      if (!isAuthenticated) {
        // Fallback mock
        return {
          id: `mock_${Date.now()}`,
          _id: `mock_${Date.now()}`,
          ...payload,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      }

      return orderService.createOrder(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('¡Pedido creado exitosamente!');
    },
    onError: () => {
      toast.error('Error al crear el pedido. Intenta de nuevo.');
    },
  });
};
