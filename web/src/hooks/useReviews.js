import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const useReviews = () => {
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: (data) => api.post('/reviews', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  return {
    createReviewAsync: createReview.mutateAsync,
    isCreatingReview: createReview.isPending,
  };
};

export default useReviews;
