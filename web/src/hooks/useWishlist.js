import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { getProductId } from '../utils/productHelpers';
import api from '../services/api';

const useWishlist = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const res = await api.get('/users/wishlist');
      return res.data?.wishlist || res.data || [];
    },
    enabled: isAuthenticated,
  });

  const addMutation = useMutation({
    mutationFn: (productId) => api.post('/users/wishlist', { productId }).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
    onError: () => toast.error('Error al agregar a favoritos'),
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => api.delete(`/users/wishlist/${productId}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
    onError: () => toast.error('Error al eliminar de favoritos'),
  });

  const isInWishlist = (product) => {
    const id = getProductId(product);
    return wishlist.some((item) => (item._id || item.id || item) === id);
  };

  const toggleItem = (product) => {
    const id = getProductId(product);
    if (!id) return;
    if (isInWishlist(product)) {
      removeMutation.mutate(id);
      toast.success('Eliminado de favoritos');
    } else {
      addMutation.mutate(id);
      toast.success('Agregado a favoritos');
    }
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    toggleItem,
    isToggling: addMutation.isPending || removeMutation.isPending,
  };
};

export default useWishlist;
