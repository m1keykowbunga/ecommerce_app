import { useState } from 'react';
import { IoStar } from 'react-icons/io5';
import { toast } from 'react-toastify';
import useReviews from '../../hooks/useReviews';
import { getProductId, getProductImage } from '../../utils/productHelpers';
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
    <Modal isOpen onClose={onClose} title="Calificar pedido">
      <div className="space-y-6">
        {items.map((item) => {
          const productId = getProductId(item.product) || item.product;
          const currentRating = ratings[productId] || 0;
          const image = item.image || getProductImage(item.product);
          const name = item.name || item.product?.name || 'Producto';

          return (
            <div key={productId} className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                {image && (
                  <img
                    src={image}
                    alt={name}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />
                )}
                <p className="font-medium text-sm">{name}</p>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRate(productId, star)}
                    className="focus:outline-none"
                  >
                    <IoStar
                      size={28}
                      className={
                        star <= currentRating
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    />
                  </button>
                ))}
                {currentRating > 0 && (
                  <span className="ml-2 text-sm text-text-secondary">
                    {STAR_LABELS[currentRating]}
                  </span>
                )}
              </div>
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
