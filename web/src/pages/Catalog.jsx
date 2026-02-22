import { useState, useMemo } from 'react';
import { IoSearch } from 'react-icons/io5';
import ProductCard from '../components/products/ProductCard';
import Badge from '../components/common/Badge';
import Loading from '../components/common/Loading';
import { SORT_OPTIONS } from '../utils/constants';
import useProducts from '../hooks/useProducts';
import { getProductId } from '../utils/productHelpers';

const Catalog = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const { data: products = [], isLoading } = useProducts();

  // Categorías derivadas dinámicamente de los productos reales
  const categories = useMemo(() => {
    const unique = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return unique.sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(term)
      );
    }

    if (category) {
      result = result.filter((p) => p.category === category);
    }

    if (sort) {
      result = [...result].sort((a, b) => {
        switch (sort) {
          case 'name_asc':
            return a.name.localeCompare(b.name);
          case 'name_desc':
            return b.name.localeCompare(a.name);
          case 'price_asc':
            return a.price - b.price;
          case 'price_desc':
            return b.price - a.price;
          case 'popular':
            return (b.totalReviews ?? b.reviewCount ?? 0) - (a.totalReviews ?? a.reviewCount ?? 0);
          case 'newest':
            return new Date(b.createdAt) - new Date(a.createdAt);
          default:
            return 0;
        }
      });
    }

    return result;
  }, [products, search, category, sort]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('');
  };

  const hasActiveFilters = search || category || sort;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-sanstext-3xl md:text-4xl font-bold text-text-primary">
          Nuestro Catálogo
        </h1>
        <p className="mt-2 text-text-muted text-lg">
          Descubre todos nuestros deliciosos productos artesanales
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered bg-brand-secondary/10 w-full pl-10"
          />
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="select select-bordered bg-brand-secondary/10"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="select select-bordered bg-brand-secondary/10"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Badge
          variant={category === '' ? 'primary' : 'outline'}
          size="md"
          onClick={() => setCategory('')}
        >
          Todos
        </Badge>
        {categories.map((cat) => (
          <Badge
            key={cat}
            variant={category === cat ? 'primary' : 'outline'}
            size="md"
            onClick={() => setCategory(cat)}
          >
            {cat}
          </Badge>
        ))}
      </div>

      {/* Results count */}
      <p className="text-sm text-text-muted mb-4">
        {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
      </p>

      {/* Product grid or empty state */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={getProductId(product)} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-xl font-medium text-text-primary mb-2">
            No se encontraron productos
          </p>
          <p className="text-text-muted mb-6">
            Intenta con otros filtros o términos de búsqueda
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn btn-primary"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Catalog;
