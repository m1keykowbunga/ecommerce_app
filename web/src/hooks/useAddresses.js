import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Llamadas directas a la API de direcciones del usuario
const fetchAddresses = async (getToken) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/users/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al cargar direcciones');
  const data = await res.json();
  return data.addresses || [];
};

const createAddress = async (addressData, getToken) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/users/address`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(addressData),
  });
  if (!res.ok) throw new Error('Error al crear dirección');
  return res.json();
};

const deleteAddress = async (addressId, getToken) => {
  const token = await getToken();
  const res = await fetch(`${API_URL}/users/address/${addressId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Error al eliminar dirección');
  return res.json();
};

const useAddresses = () => {
  const { isAuthenticated, getToken } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: addresses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchAddresses(getToken),
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data) => createAddress(data, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteAddress(id, getToken),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return {
    addresses,
    isLoading,
    error,
    createAddress: (data) => createMutation.mutate(data),
    createAddressAsync: (data) => createMutation.mutateAsync(data),
    deleteAddress: (id) => deleteMutation.mutate(id),
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useAddresses;
