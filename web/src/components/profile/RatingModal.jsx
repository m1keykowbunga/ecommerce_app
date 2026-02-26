import { useState } from 'react';
import { IoStar } from 'react-icons/io5';
import { toast } from 'react-toastify';
import useReviews from '../../hooks/useReviews';
import { getProductId, getProductImage } from '../../utils/productHelpers';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import Modal from '../common/Modal';

const STAR_LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

const RatingModal = ({ order, onClose }) => {
  const { createReviewAsync, isCreatingReview } = useReviews();
  const items = order?.orderItems || order?.items || [];
  const [ratings, setRatings] = useState({});

  const handleRate = (productId, rating) => {
    setRatings((prev) => ({ ...prev, [productId]: rating }));
  };

  const allRated = items.every((item) => {
    const id = getProductId(item.product) || item.product;
    return ratings[id] > 0;
  });

  const handleSubmit = async () => {
    if (!allRated) {
      toast.warning('Por favor califica todos los productos');
      return;
    }
    try {
      const orderId = order._id || order.id;
      const results = await Promise.allSettled(
        items.map((item) => {
          const productId = getProductId(item.product) || item.product;
          return createReviewAsync({ productId, orderId, rating: ratings[productId] });
        })
      );
      const failures = results.filter((r) => r.status === 'rejected');
      if (failures.length > 0) {
        toast.error(`${failures.length} calificación(es) no se enviaron`);
        return;
      }
      toast.success('¡Gracias por tu calificación!');
      onClose();
    } catch {
      toast.error('Error al enviar calificación');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="Calificar Productos">
      <div className="space-y-4">
        {items.map((item) => {
          const productId = getProductId(item.product) || item.product;
          const currentRating = ratings[productId] || 0;
          const image = item.image || getProductImage(item.product);
          const name = item.name || item.product?.name || 'Producto';

          return (
            <div key={productId} className="bg-brand-accent/10 rounded-xl p-4">
              {/* Fila superior: imagen + info */}
              <div className="flex items-center gap-3 mb-3">
                {image && (
                  <img
                    src={image}
                    alt={name}
                    className="w-16 h-16 rounded-lg object-contain bg-white shrink-0"
                  />
                )}
                <div>
                  <p className="font-semibold text-sm">{name}</p>
                  {item.quantity && (
                    <p className="text-xs text-text-secondary">Cantidad: {item.quantity}</p>
                  )}
                  {item.price && (
                    <p className="text-sm font-medium text-brand-accent">
                      {formatCurrency(item.price)}
                    </p>
                  )}
                </div>
              </div>

              {/* Estrellas */}
              <div className="flex justify-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(productId, star)}
                    className="focus:outline-none"
                  >
                    <IoStar
                      size={32}
                      className={star <= currentRating ? 'text-brand-accent' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
              {currentRating > 0 && (
                <p className="text-sm text-text-secondary text-center mt-1">
                  {STAR_LABELS[currentRating]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose} disabled={isCreatingReview}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isCreatingReview}
          disabled={!allRated || isCreatingReview}
        >
          Enviar calificación
        </Button>
      </div>
    </Modal>
  );
};

export default RatingModal;
