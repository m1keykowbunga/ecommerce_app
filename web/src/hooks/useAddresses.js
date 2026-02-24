import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const useAddresses = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: addresses = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/users/addresses');
      return res.data?.addresses || res.data || [];
    },
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post('/users/addresses', data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => api.put(`/users/addresses/${id}`, data).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/users/addresses/${id}`).then((r) => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['addresses'] }),
  });

  return {
    addresses,
    isLoading,
    error,
    createAddress: (data) => createMutation.mutate(data),
    createAddressAsync: (data) => createMutation.mutateAsync(data),
    updateAddress: ({ id, data }) => updateMutation.mutate({ id, data }),
    updateAddressAsync: ({ id, data }) => updateMutation.mutateAsync({ id, data }),
    deleteAddress: (id) => deleteMutation.mutate(id),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

export default useAddresses;
