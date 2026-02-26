import { useParams, Link } from 'react-router-dom';
import { IoArrowBack, IoDownload } from 'react-icons/io5';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useOrderDetail } from '../../hooks/useOrders';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getProductImage } from '../../utils/productHelpers';
import OrderTimeline from '../../components/profile/OrderTimeline';
import Button from '../../components/common/Button';

const PAYMENT_LABELS = {
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia bancaria',
  tarjeta: 'Tarjeta de crédito/débito',
  stripe: 'Tarjeta de crédito/débito',
};

const OrderDetail = () => {
  const { id } = useParams();
  const { order, isLoading } = useOrderDetail(id);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl flex justify-center">
        <span className="loading loading-spinner loading-lg text-brand-primary" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Pedido no encontrado</h2>
        <Link to="/perfil/pedidos">
          <Button variant="primary">Volver a mis pedidos</Button>
        </Link>
      </div>
    );
  }

  // Normalizar campos: soporte para estructura del backend real y estructura mock
  const orderId = order._id || order.id || '';
  const shortId = `#${orderId.slice(-8).toUpperCase()}`;
  const items = order.items || order.orderItems || [];
  const address = order.address || order.shippingAddress;
  const total = order.total || order.totalPrice || 0;
  const subtotal = order.subtotal || total;
  const iva = order.iva || 0;
  const shipping = order.shipping || 0;
  const paymentMethod = order.paymentMethod
    || order.paymentResult?.method
    || (order.paymentResult?.id?.startsWith('pi_') ? 'stripe'
      : order.paymentResult?.id?.startsWith('transfer_') ? 'transferencia'
      : '');
  const timeline = order.timeline || [];
  const statusColor = ORDER_STATUS_COLORS[order.status] || '#999999';

  const handleDownloadInvoice = async () => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `factura-DonPalitoJr-${shortId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      // El interceptor de api.js ya muestra toast en errores 500
      if (error?.response?.status !== 500) {
        toast.error('No se pudo descargar la factura. Intenta de nuevo.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/perfil/pedidos" className="text-gray-500 hover:text-brand-primary">
          <IoArrowBack size={24} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-secondary">Pedido {shortId}</h1>
            {/* Badge inline — igual que mobile (statusColor + '20' de fondo) */}
            <div
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: statusColor + '20', color: statusColor }}
            >
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Realizado el {formatDate(order.createdAt, 'DD [de] MMMM [de] YYYY')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos y dirección */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            <div className="space-y-4">
              {items.map((item, i) => {
                const product = item.product || {
                  name: item.name,
                  images: item.image ? [item.image] : [],
                };
                const unitPrice = item.unitPrice || item.price || 0;
                return (
                  <div key={i} className="flex items-center gap-4">
                    <img
                      src={getProductImage(product)}
                      alt={product.name || item.name}
                      className="w-16 h-16 rounded-lg object-contain bg-base-200"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{product.name || item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatCurrency(unitPrice)}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatCurrency(item.quantity * unitPrice)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {address && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-3">Dirección de envío</h2>
              <p className="font-medium">{address.fullName}</p>
              <p className="text-sm text-gray-600">{address.streetAddress}</p>
              <p className="text-sm text-gray-600">{address.city}</p>
              <p className="text-sm text-gray-600">Tel: {address.phoneNumber}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Botón de factura — visible en paid y delivered */}
          {(order.status === 'paid' || order.status === 'delivered') && (
            <Button
              variant="primary"
              fullWidth
              icon={<IoDownload size={16} />}
              onClick={handleDownloadInvoice}
            >
              Descargar factura
            </Button>
          )}

          {/* Resumen de totales */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              {subtotal !== total && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              )}
              {iva > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IVA (19%)</span>
                  <span>{formatCurrency(iva)}</span>
                </div>
              )}
              {shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-primary">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <p className="text-sm text-gray-500">Método de pago</p>
              <p className="font-medium">{PAYMENT_LABELS[paymentMethod] || paymentMethod || '—'}</p>
            </div>
          </div>

          {/* Timeline de estado */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Estado del pedido</h2>
            <OrderTimeline timeline={timeline} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
