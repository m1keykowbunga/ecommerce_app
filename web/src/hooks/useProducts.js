import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/index';
import { products as mockProducts } from '../data/mockData';

const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      try {
        const data = await productService.getProducts();
        return Array.isArray(data) ? data : data.products || mockProducts;
      } catch {
        return mockProducts;
      }
    },
  });
};

export default useProducts;
