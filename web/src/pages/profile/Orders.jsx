import { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoReceiptOutline, IoCartOutline } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { orderServiceMock } from '../../services/orderService';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const Orders = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('');
  const allOrders = orderServiceMock.getUserOrders(user?.id || 'u1');

  const filteredOrders = statusFilter
    ? allOrders.filter((o) => o.status === statusFilter)
    : allOrders;

  const statuses = Object.entries(ORDER_STATUS_LABELS);

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

      {/* Filter */}
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

      {/* Orders list */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <Link
            key={order.id}
            to={`/perfil/pedidos/${order.id}`}
            className="block bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <IoReceiptOutline className="text-brand-primary" size={22} />
                <span className="font-semibold">{order.id}</span>
              </div>
              <Badge variant={ORDER_STATUS_COLORS[order.status]}>
                {ORDER_STATUS_LABELS[order.status] || order.status}
              </Badge>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>{order.items.length} producto(s) - {formatDate(order.createdAt)}</span>
              <span className="font-semibold text-gray-800">{formatCurrency(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Orders;
