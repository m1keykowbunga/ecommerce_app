import { useState } from 'react';
import { IoStar, IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { reviewService } from '../../services/index';
import { getProductId, getProductImage } from '../../utils/productHelpers';
import Button from '../common/Button';
import Modal from '../common/Modal';

const STAR_LABELS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

const RatingModal = ({ order, onClose }) => {
  const queryClient = useQueryClient();
  const items = order?.orderItems || order?.items || [];
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);
    try {
      for (const item of items) {
        const productId = getProductId(item.product) || item.product;
        const rating = ratings[productId];
        await reviewService.createReview({
          productId,
          orderId: order._id || order.id,
          rating,
        });
      }
      toast.success('¡Gracias por tu calificación!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    } catch {
      toast.error('Error al enviar calificación');
    } finally {
      setSubmitting(false);
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
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={submitting}
          disabled={!allRated || submitting}
        >
          Enviar calificación
        </Button>
      </div>
    </Modal>
  );
};

export default RatingModal;
