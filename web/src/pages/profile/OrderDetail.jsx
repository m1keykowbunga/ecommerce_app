import { useParams, Link } from 'react-router-dom';
import { IoArrowBack, IoDownload } from 'react-icons/io5';
import { orderServiceMock } from '../../services/orderService';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getProductImage } from '../../utils/productHelpers';
import { downloadCSV } from '../../utils/exportHelpers';
import OrderTimeline from '../../components/profile/OrderTimeline';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';

const PAYMENT_LABELS = {
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia bancaria',
  [PAYMENT_METHODS.QR]: 'QR Nequi/Daviplata',
  [PAYMENT_METHODS.CASH]: 'Efectivo contra entrega',
};

const downloadInvoice = (order) => {
  const headers = ['Producto', 'Cantidad', 'Precio Unitario', 'Subtotal'];
  const rows = order.items.map((item) => [
    item.product.name,
    item.quantity,
    item.unitPrice,
    item.quantity * item.unitPrice,
  ]);
  rows.push([]);
  rows.push(['', '', 'Subtotal', order.subtotal]);
  rows.push(['', '', 'IVA (19%)', order.iva]);
  if (order.shipping > 0) rows.push(['', '', 'Envío', order.shipping]);
  rows.push(['', '', 'TOTAL', order.total]);
  rows.push([]);
  rows.push(['Pedido:', order.id, 'Fecha:', order.createdAt]);
  rows.push(['Estado:', ORDER_STATUS_LABELS[order.status] || order.status]);
  downloadCSV(`factura-${order.id}`, headers, rows);
};

const OrderDetail = () => {
  const { id } = useParams();
  const order = orderServiceMock.getOrderById(id);

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/perfil/pedidos" className="text-gray-500 hover:text-brand-primary">
          <IoArrowBack size={24} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-brand-secondary">Pedido {order.id}</h1>
            <Badge variant={ORDER_STATUS_COLORS[order.status]}>
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Realizado el {formatDate(order.createdAt, 'DD [de] MMMM [de] YYYY')}</p>
        </div>
        {(order.status === 'paid' || order.status === 'delivered') && (
          <Button
            variant="ghost"
            size="sm"
            icon={<IoDownload size={16} />}
            onClick={() => downloadInvoice(order)}
          >
            Descargar factura
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Productos</h2>
            <div className="space-y-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dirección */}
          {order.address && (
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-3">Dirección de envío</h2>
              <p className="font-medium">{order.address.fullName}</p>
              <p className="text-sm text-gray-600">{order.address.streetAddress}</p>
              <p className="text-sm text-gray-600">{order.address.city}</p>
              <p className="text-sm text-gray-600">Tel: {order.address.phoneNumber}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Totales */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Resumen</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">IVA (19%)</span>
                <span>{formatCurrency(order.iva)}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Envío</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span>
                <span className="text-brand-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>

            <div className="border-t mt-4 pt-4">
              <p className="text-sm text-gray-500">Método de pago</p>
              <p className="font-medium">{PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Estado del pedido</h2>
            <OrderTimeline timeline={order.timeline} currentStatus={order.status} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
