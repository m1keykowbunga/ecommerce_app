import { Link } from 'react-router-dom';
import { IoStar, IoCart, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import useWishlist from '../../hooks/useWishlist';
import { formatCurrency } from '../../utils/formatters';
import { getProductId, getProductImage } from '../../utils/productHelpers';

const ProductCard = ({ product }) => {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleItem, isToggling } = useWishlist();

  // Compatible con mock (available) y MongoDB (stock)
  const isAvailable = product.available !== false && (product.available === true || (product.stock ?? 1) > 0);

  const handleWishlist = (e) => {
    e.preventDefault(); // evitar que el Link envolvente navegue
    if (!isAuthenticated) {
      toast.info('Inicia sesión para guardar favoritos');
      return;
    }
    toggleItem(product);
  };

  return (
    <div className="card-product group">
      <Link to={`/producto/${getProductId(product)}`}>
        <div className="relative aspect-square overflow-hidden">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          />
          {!isAvailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <span className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm">
                Agotado
              </span>
            </div>
          )}
          {product.discount && isAvailable && (
            <span className="badge-discount absolute left-3 top-3 shadow-lg">
              -{product.discount}%
            </span>
          )}
          {/* Botón de favoritos — esquina superior derecha (patrón mobile) */}
          <button
            onClick={handleWishlist}
            disabled={isToggling}
            className="absolute top-3 right-3 p-2 rounded-full bg-brand-secondary/10 backdrop-blur-sm hover:bg-brand-secondary/20 transition-all disabled:opacity-50 z-10"
            aria-label={isInWishlist(product) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          >
            {isInWishlist(product)
              ? <IoHeart size={18} style={{ color: '#C34928' }} />
              : <IoHeartOutline size={18} style={{ color: '#5B3A29' }} />
            }
          </button>
        </div>
      </Link>

      <div className="p-4">
        <Link to={`/producto/${getProductId(product)}`}>
          <h3 className="font-bold text-text-primary hover:text-brand-primary transition-colors line-clamp-2 text-lg">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-1 text-sm">
          <IoStar className="text-brand-accent fill-current" />
          <span className="font-medium text-text-primary">
            {product.averageRating ?? product.rating ?? '—'}
          </span>
          <span className="text-text-muted">
            ({product.totalReviews ?? product.reviewCount ?? 0})
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            {product.discount ? (
              <div className="flex flex-col">
                <span className="font-bold text-brand-primary text-lg">
                  {formatCurrency(product.price * (1 - product.discount / 100))}
                </span>
                <span className="text-xs text-text-muted line-through">
                  {formatCurrency(product.price)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-brand-primary text-lg">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          <button
            disabled={!isAvailable}
            onClick={(e) => {
              e.preventDefault();
              addItem(product);
            }}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-brand-primary text-white hover:bg-brand-secondary transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            <IoCart className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
