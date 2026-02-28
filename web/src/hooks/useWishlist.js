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
      const rawData = res.data?.wishlist || res.data?.data || res.data;
      return Array.isArray(rawData) ? rawData : [];
    },
    enabled: !!isAuthenticated, // Solo se ejecuta si hay usuario
    staleTime: 0, 
    refetchOnMount: true, // Re-sincroniza al entrar a la página
  });

  const addMutation = useMutation({
    mutationFn: (productId) => {
      // 🛡️ VALIDACIÓN CRÍTICA: No enviar IDs que no sean de MongoDB (24 caracteres)
      if (productId.length < 10) { 
        throw new Error("Este es un producto local/mock y no puede guardarse en la DB real.");
      }
      return api.post('/users/wishlist', { productId }).then((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Agregado a favoritos');
    },
    onError: (error) => {
      const msg = error.message || 'Error al agregar a favoritos';
      toast.error(msg);
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) => api.delete(`/users/wishlist/${productId}`).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success('Eliminado de favoritos');
    },
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
    } else {
      addMutation.mutate(id);
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