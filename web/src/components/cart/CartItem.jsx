import { Link } from 'react-router-dom';
import { IoAdd, IoRemove, IoTrashOutline } from 'react-icons/io5';
import { useCart } from '../../contexts/CartContext';
import { getProductId, getProductImage } from '../../utils/productHelpers';
import { formatCurrency } from '../../utils/formatters';
import { LIMITS } from '../../utils/constants';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity } = item;
  const image = getProductImage(product);

  const hasDiscount = product.discount > 0;
  const effectivePrice = hasDiscount
    ? product.price * (1 - product.discount / 100)
    : product.price;
  const lineTotal = effectivePrice * quantity;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      {/* Product Image */}
      <Link to={`/producto/${getProductId(product)}`} className="shrink-0">
        <img
          src={image}
          alt={product.name}
          className="w-20 h-20 object-contain rounded-lg bg-base-200"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          to={`/producto/${getProductId(product)}`}
          className="font-medium text-gray-800 hover:text-brand-primary transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        <div className="mt-1">
          {hasDiscount ? (
            <div className="flex items-center gap-2">
              <span className="text-brand-primary font-semibold">
                {formatCurrency(effectivePrice)}
              </span>
              <span className="text-gray-400 text-sm line-through">
                {formatCurrency(product.price)}
              </span>
            </div>
          ) : (
            <span className="text-brand-primary font-semibold">
              {formatCurrency(product.price)}
            </span>
          )}
        </div>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(getProductId(product), quantity - 1)}
          className="btn btn-sm btn-ghost btn-circle"
          aria-label="Disminuir cantidad"
        >
          <IoRemove size={18} />
        </button>
        <span className="w-8 text-center font-medium">{quantity}</span>
        <button
          onClick={() =>
            quantity < LIMITS.maxQuantityPerItem &&
            updateQuantity(getProductId(product), quantity + 1)
          }
          className="btn btn-sm btn-ghost btn-circle"
          disabled={quantity >= LIMITS.maxQuantityPerItem}
          aria-label="Aumentar cantidad"
        >
          <IoAdd size={18} />
        </button>
      </div>

      {/* Line Total */}
      <div className="text-right min-w-[100px] hidden sm:block">
        <span className="font-semibold text-gray-800">
          {formatCurrency(lineTotal)}
        </span>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeItem(getProductId(product))}
        className="btn btn-sm btn-ghost btn-circle text-red-500 hover:bg-red-50"
        aria-label="Eliminar producto"
      >
        <IoTrashOutline size={20} />
      </button>
    </div>
  );
};

export default CartItem;
