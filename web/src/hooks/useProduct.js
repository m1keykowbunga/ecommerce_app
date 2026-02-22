import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/index';
import { products as mockProducts } from '../data/mockData';

export const useProduct = (productId) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const findInMock = () =>
        mockProducts.find((p) => p.id === productId || p._id === productId) || null;
      try {
        const data = await productService.getProductById(productId);
        return data.product || data || findInMock();
      } catch {
        return findInMock();
      }
    },
    enabled: !!productId,
  });
};
