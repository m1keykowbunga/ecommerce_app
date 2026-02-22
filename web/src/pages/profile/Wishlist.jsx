import { Link } from 'react-router-dom';
import { IoHeartDislike, IoCartOutline, IoArrowBack } from 'react-icons/io5';
import { toast } from 'react-toastify';
import useWishlist from '../../hooks/useWishlist';
import useProducts from '../../hooks/useProducts';
import { useCart } from '../../contexts/CartContext';
import { getProductId, getProductImage, getFinalPrice } from '../../utils/productHelpers';
import { formatCurrency } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Loading from '../../components/common/Loading';
import Badge from '../../components/common/Badge';

const Wishlist = () => {
  const { wishlist, isLoading: wishlistLoading, toggleItem } = useWishlist();
  const { data: allProducts = [], isLoading: productsLoading } = useProducts();
  const { addItem } = useCart();

  const isLoading = wishlistLoading || productsLoading;

  // Cruza IDs de wishlist con datos completos de productos
  const wishlistProducts = wishlist
    .map((item) => {
      const id = item._id || item.id || item;
      return allProducts.find(
        (p) => (p._id || p.id) === id
      );
    })
    .filter(Boolean);

  const handleAddToCart = (product) => {
    addItem(product, 1);
    toast.success(`${product.name} agregado al carrito`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/perfil">
          <Button variant="ghost" size="sm" icon={<IoArrowBack size={18} />}>
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

      {wishlistProducts.length === 0 ? (
        <div className="text-center py-16">
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => {
            const id = getProductId(product);
            const image = getProductImage(product);
            const price = getFinalPrice(product);
            const hasDiscount = product.discount > 0;

            return (
              <div
                key={id}
                className="bg-white rounded-xl shadow-sm border border-ui-border overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link to={`/producto/${id}`}>
                  <img
                    src={image}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-4">
                  <Link to={`/producto/${id}`}>
                    <h3 className="font-semibold text-text-primary hover:text-brand-primary transition-colors line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-brand-primary font-bold">
                      {formatCurrency(price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs text-gray-400 line-through">
                        {formatCurrency(product.price)}
                      </span>
                    )}
                  </div>

                  {product.stock === 0 ? (
                    <Badge variant="error" size="sm" className="mb-3">
                      Sin stock
                    </Badge>
                  ) : product.stock <= 5 ? (
                    <Badge variant="warning" size="sm" className="mb-3">
                      Últimas {product.stock} unidades
                    </Badge>
                  ) : null}

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      fullWidth
                      icon={<IoCartOutline size={16} />}
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                    >
                      Agregar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<IoHeartDislike size={16} />}
                      onClick={() => toggleItem(product)}
                      className="text-red-500 hover:text-red-600"
                      title="Quitar de favoritos"
                    />
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
