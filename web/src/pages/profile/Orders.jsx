import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoReceiptOutline, IoCartOutline, IoStar, IoCheckmarkCircle } from 'react-icons/io5';
import { useOrders } from '../../hooks/useOrders';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import RatingModal from '../../components/profile/RatingModal';

const Orders = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { data: allOrders = [], isLoading, isError } = useOrders();

  const filteredOrders = statusFilter
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  const statuses = Object.entries(ORDER_STATUS_LABELS);

  const handleOpenRating = (order) => setSelectedOrder(order);
  const handleCloseRating = () => setSelectedOrder(null);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mis Pedidos</h1>
        <div className="flex justify-center py-12">
          <span className="loading loading-spinner loading-lg text-brand-primary" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mis Pedidos</h1>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <IoReceiptOutline className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No se pudieron cargar los pedidos</h2>
          <p className="text-gray-500">Verifica que el servidor esté corriendo e intenta de nuevo.</p>
        </div>
      </div>
    );
  }

  if (allOrders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mis Pedidos</h1>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <IoCartOutline className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Sin pedidos aún</h2>
          <p className="text-gray-500 mb-6">Cuando realices tu primer pedido, aparecerá aquí.</p>
          <Link to="/catalogo">
            <Button variant="primary">Ver catálogo</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mis Pedidos</h1>

      {/* Filtros por estado */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !statusFilter ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Todos ({allOrders.length})
        </button>
        {statuses.map(([key, label]) => {
          const count = allOrders.filter((o) => o.status === key).length;
          if (count === 0) return null;
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                statusFilter === key
                  ? 'bg-brand-primary text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const orderId = order._id || order.id;
          const items = order.items || order.orderItems || [];
          const total = order.total || order.totalPrice || 0;
          return (
            <Link
              key={orderId}
              to={`/perfil/pedidos/${orderId}`}
              className="block bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <IoReceiptOutline className="text-brand-primary" size={22} />
                  <span className="font-semibold text-text-primary">
                    #{orderId.slice(-8).toUpperCase()}
                  </span>
                </div>
                {/* Badge de estado — patrón idéntico a mobile orders.tsx */}
                <div
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: (ORDER_STATUS_COLORS[order.status] || '#999999') + '20' }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ color: ORDER_STATUS_COLORS[order.status] || '#999999' }}
                  >
                    {ORDER_STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{items.length} producto(s) - {formatDate(order.createdAt)}</span>
                <span className="font-semibold text-gray-800">{formatCurrency(total)}</span>
              </div>

              {/* Botón calificar / badge calificado — solo para pedidos entregados */}
              {order.status === 'delivered' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  {order.hasReviewed ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-brand-secondary bg-brand-secondary/15 px-3 py-1.5 rounded-full">
                      <IoCheckmarkCircle size={16} className="text-brand-accent" />
                      <span>Calificado</span>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleOpenRating(order);
                      }}
                      className="flex items-center gap-1.5 text-sm font-semibold text-white bg-brand-primary hover:bg-brand-primary/90 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <IoStar size={15} />
                      <span>Calificar</span>
                    </button>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Modal de calificación */}
      {selectedOrder && (
        <RatingModal order={selectedOrder} onClose={handleCloseRating} />
      )}
    </div>
  );
};

export default Orders;
