import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoCart, IoAdd, IoRemove, IoHeart, IoHeartOutline } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import useWishlist from '../hooks/useWishlist';
import { useProduct } from '../hooks/useProduct';
import { getProductId, getProductImage } from '../utils/productHelpers';
import { formatCurrency } from '../utils/formatters';
import { categories } from '../data/mockData';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Rating from '../components/common/Rating';
import Loading from '../components/common/Loading';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleItem, isToggling } = useWishlist();
  const { data: product, isLoading } = useProduct(id);

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loading size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
        <p className="text-gray-600 mb-8">El producto que buscas no existe o fue eliminado.</p>
        <Link to="/catalogo" className="btn btn-primary">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const images = product.images?.length
    ? product.images
    : [getProductImage(product)].filter(Boolean);

  const mainImage = images[activeImage] || images[0] || '';
  const category = categories.find((c) => c.id === product.category);
  const rating = product.averageRating ?? product.rating ?? 0;
  const inStock = product.available !== false && (product.stock === undefined || product.stock > 0);
  const maxQty = product?.stock ?? 99;

  const finalPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  const handleAddToCart = () => {
    addItem(product, qty);
    setQty(1);
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      toast.info('Inicia sesión para guardar favoritos');
      return;
    }
    toggleItem(product);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-brand-primary hover:underline mb-6"
      >
        <IoArrowBack />
        Volver al catálogo
      </button>

      {/* Main Grid */}
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Galería de imágenes */}
        <div>
          <img
            src={mainImage}
            alt={product.name}
            className="w-full rounded-lg border object-cover aspect-square mb-3"
          />
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 rounded-md border-2 overflow-hidden ${
                    activeImage === idx ? 'border-brand-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          {category && (
            <Badge variant="outline" size="sm">
              {category.name}
            </Badge>
          )}

          <h1 className="text-3xl font-bold text-text-primary">
            {product.name}
          </h1>

          {rating > 0 && <Rating rating={rating} showNumber />}

          <p className="text-gray-600">{product.description}</p>

          {product.stock !== undefined && (
            <p className="text-sm text-text-muted">
              {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
            </p>
          )}

          {/* Precio */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-brand-primary">
              {formatCurrency(finalPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400 line-through">
                  {formatCurrency(product.price)}
                </span>
                <Badge variant="error" size="sm">
                  -{product.discount}%
                </Badge>
              </>
            )}
          </div>

          {/* Selector de cantidad */}
          {inStock && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Cantidad:</span>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <IoRemove size={16} />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="px-3 py-2 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <IoAdd size={16} />
                </button>
              </div>
              {qty >= maxQty && (
                <span className="text-xs text-orange-500">
                  Máx. disponible
                </span>
              )}
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-col gap-3 mt-2">
            <Button
              variant="primary"
              fullWidth
              icon={<IoCart size={20} />}
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              {inStock
                ? `Agregar al Carrito${qty > 1 ? ` (${qty})` : ''}`
                : 'Producto Agotado'}
            </Button>

            {!inStock && (
              <Badge variant="error" size="lg" className="justify-center">
                Agotado
              </Badge>
            )}

            {/* Botón de favoritos */}
            <Button
              variant="ghost"
              fullWidth
              icon={
                isInWishlist(product)
                  ? <IoHeart size={20} style={{ color: '#C34928' }} />
                  : <IoHeartOutline size={20} style={{ color: '#5B3A29' }} />
              }
              onClick={handleWishlist}
              disabled={isToggling}
            >
              {isInWishlist(product) ? 'Guardado en favoritos' : 'Agregar a favoritos'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
