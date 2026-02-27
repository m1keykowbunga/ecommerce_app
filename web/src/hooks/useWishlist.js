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
      try {
        const res = await api.get('/users/wishlist');
        // 🛡️ Extraemos los datos sin importar cómo los mande el backend
        const rawData = res.data?.wishlist || res.data?.data || res.data;
        return Array.isArray(rawData) ? rawData : [];
      } catch (error) {
        console.error("Error en Wishlist:", error);
        return []; // Retorna array vacío para que .some() no explote
      }
    },
    enabled: isAuthenticated,
    initialData: [], // 👈 Vital para que el primer render no sea undefined
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
    if (!id) return false;
    
    // 🛡️ Blindaje: Si wishlist no es un array, no intentes usar .some()
    if (!Array.isArray(wishlist)) {
      console.warn("Wishlist no es un array, valor actual:", wishlist);
      return false;
    }

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
