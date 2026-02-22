import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { getProductId } from '../utils/productHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const fetchWishlist = async (getToken) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar wishlist');
  const data = await res.json();
  return data.wishlist || [];
};

const toggleWishlistItem = async (productId, getToken) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/users/wishlist`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId }),
  });
  if (!res.ok) throw new Error('Error al actualizar wishlist');
  return res.json();
};

const useWishlist = () => {
  const { isAuthenticated, getToken } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => fetchWishlist(getToken),
    enabled: isAuthenticated,
  });

  const toggleMutation = useMutation({
    mutationFn: (productId) => toggleWishlistItem(productId, getToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
    onError: () => toast.error('Error al actualizar favoritos'),
  });

  const isInWishlist = (product) => {
    const id = getProductId(product);
    return wishlist.some(
      (item) => (item._id || item.id || item) === id
    );
  };

  const toggleItem = (product) => {
    const id = getProductId(product);
    if (!id) return;
    const inList = isInWishlist(product);
    toggleMutation.mutate(id);
    toast.success(inList ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  return {
    wishlist,
    isLoading,
    isInWishlist,
    toggleItem,
    isToggling: toggleMutation.isPending,
  };
};

export default useWishlist;
