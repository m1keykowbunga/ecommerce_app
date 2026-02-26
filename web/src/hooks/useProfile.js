import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/index';

const useProfile = () => {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const data = await userService.getProfile();
      return data?.user || data;
    },
    enabled: isAuthenticated,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Datos personales actualizados');
    },
    onError: (err) => {
      // api.js ya maneja 403 y 500 con toast — evitar duplicado
      const status = err?.response?.status;
      if (status === 400) {
        toast.error(err.response.data?.error || 'Datos inválidos. Revisa los campos.');
      } else if (status === 404) {
        toast.error('Perfil no encontrado. Intenta recargar la página.');
      } else if (!err?.response) {
        toast.error('Sin conexión al servidor.');
      }
    },
  });

  const notificationsMutation = useMutation({
    mutationFn: userService.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      toast.success('Preferencias de notificaciones actualizadas');
    },
    onError: (err) => {
      // api.js ya maneja 403 y 500 con toast — evitar duplicado
      const status = err?.response?.status;
      if (status === 404) {
        toast.error('Perfil no encontrado. Intenta recargar la página.');
      } else if (!err?.response) {
        toast.error('Sin conexión al servidor.');
      }
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: userService.deactivateAccount,
    onError: (err) => {
      toast.error(err?.response?.data?.error || 'Error al desactivar la cuenta');
    },
  });

  return {
    profile,
    isLoading,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    updateNotifications: notificationsMutation.mutate,
    isUpdatingNotifications: notificationsMutation.isPending,
    deactivateAccount: deactivateMutation.mutateAsync,
    isDeactivating: deactivateMutation.isPending,
  };
};

export default useProfile;
