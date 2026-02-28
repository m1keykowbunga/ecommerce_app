import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { IoHeartDislike, IoCartOutline, IoArrowBack } from 'react-icons/io5';
import useWishlist from '../../hooks/useWishlist';
import useProducts from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { getProductId, getProductImage, getFinalPrice } from '../../utils/productHelpers';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';

const Wishlist = () => {
  // 1. Hooks de datos
  const { wishlist, isLoading: wishlistLoading, toggleItem } = useWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const { addItem } = useCart();

  // 2. Estado de carga unificado
  const isLoading = wishlistLoading || productsLoading || allProducts.length === 0;

  // 3. Cruce de datos blindado
  const wishlistProducts = useMemo(() => {
    // Si no hay datos, evitamos procesar
    if (!wishlist || !allProducts.length) return [];

    return wishlist
      .map((item) => {
        // Extraemos el ID sin importar si item es objeto o string (MongoDB ID)
        const id = item._id || item.id || (typeof item === 'string' ? item : null);
        if (!id) return null;

        // Buscamos el producto en el catálogo global
        return allProducts.find((p) => (p._id || p.id) === id);
      })
      .filter(Boolean); // Eliminamos nulos (productos no encontrados o IDs inválidos)
  }, [wishlist, allProducts]);

  const handleAddToCart = (product) => {
    addItem(product, 1);
  };

  // Renderizado de carga
if (isLoading) {
  return (
    <div className="flex flex-col justify-center items-center py-32 gap-4">
      <Loading size="lg" />
      <p className="text-gray-400 animate-pulse text-sm">Sincronizando tus favoritos...</p>
    </div>
  );
}

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Cabecera */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/perfil">
          <Button 
            variant="ghost" 
            size="sm" 
            icon={<IoArrowBack size={18} />}
          >
            Volver al perfil
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">
          Mis Favoritos
        </h1>
        {wishlistProducts.length > 0 && (
          <Badge variant="primary">{wishlistProducts.length}</Badge>
        )}
      </div>

      {/* Contenido Condicional */}
      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <IoHeartDislike size={64} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Tu lista de favoritos está vacía
          </h2>
          <p className="text-text-secondary mb-6">
            Agrega productos a favoritos para encontrarlos fácilmente
          </p>
          <Link to="/catalogo">
            <Button variant="primary">Explorar catálogo</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => {
            const id = getProductId(product);
            const image = getProductImage(product);
            const price = getFinalPrice(product);
            const hasDiscount = product.discount > 0;

            return (
              <div key={id} className="card-product flex flex-col h-full bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-lg overflow-hidden border border-gray-100">
                <Link to={`/producto/${id}`}>
                  <div className="w-full h-48 bg-white p-4 flex items-center justify-center">
                    <img
                      src={image}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </Link>
                
                <div className="p-4 flex flex-col flex-grow">
                  <Link to={`/producto/${id}`}>
                    <h3 className="font-semibold text-text-primary hover:text-brand-primary transition-colors line-clamp-2 mb-2 min-h-[3rem]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-brand-primary font-bold text-lg">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-sm text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {/* Stock Badges */}
                  <div className="mb-4">
                    {product.stock === 0 ? (
                      <Badge variant="error" size="sm">Sin stock</Badge>
                    ) : product.stock <= 5 ? (
                      <Badge variant="warning" size="sm">¡Últimas {product.stock} unidades!</Badge>
                    ) : null}
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon={<IoCartOutline size={18} />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<IoHeartDislike size={20} />}
                      onClick={() => toggleItem(product)}
                      className="text-red-500 hover:bg-red-50"
                      title="Quitar de favoritos"
                    >
                      {/* Espacio para evitar warning de children si el componente lo requiere */}
                      <span className="sr-only">Quitar</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;