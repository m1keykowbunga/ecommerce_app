import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { cartService } from '../services/index';
import { getProductId } from '../utils/productHelpers';

const useServerCart = () => {
  const queryClient = useQueryClient();

  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      try {
        const data = await cartService.getCart();
        return data;
      } catch {
        return { items: [], total: 0 };
      }
    },
  });

  // El backend devuelve { cart: { items: [...] } }, pero también soportamos { items: [...] }
  const items = cartData?.cart?.items || cartData?.items || [];
  const subtotal = items.reduce((acc, item) => {
    const price = item.product?.discount
      ? Math.round(item.product.price * (1 - item.product.discount / 100))
      : item.product?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartService.addToCart(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Error al agregar al carrito'),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ productId, quantity }) =>
      cartService.updateItem(productId, quantity),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Error al actualizar cantidad'),
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId) => cartService.removeItem(productId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: () => toast.error('Error al eliminar del carrito'),
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  return {
    items,
    subtotal,
    itemCount: items.reduce((acc, i) => acc + i.quantity, 0),
    isLoading,
    addItem: (product, quantity = 1) => {
      const productId = getProductId(product);
      addToCartMutation.mutate({ productId, quantity });
      toast.success(`${product.name} agregado al carrito`);
    },
    updateItem: (productId, quantity) =>
      updateItemMutation.mutate({ productId, quantity }),
    removeItem: (productId) => removeItemMutation.mutate(productId),
    clearCart: () => clearCartMutation.mutate(),
  };
};

export default useServerCart;
