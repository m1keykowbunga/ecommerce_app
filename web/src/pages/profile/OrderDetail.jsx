import { useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { IoArrowBack, IoDownload } from 'react-icons/io5';
import { useReactToPrint } from 'react-to-print';
import { useOrderDetail } from '../../hooks/useOrders';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, PAYMENT_METHODS } from '../../utils/constants';
import { formatCurrency, formatDate, formatDateTime } from '../../utils/formatters';
import { getProductImage } from '../../utils/productHelpers';
import OrderTimeline from '../../components/profile/OrderTimeline';
import Button from '../../components/common/Button';

const PAYMENT_LABELS = {
  [PAYMENT_METHODS.TRANSFER]: 'Transferencia bancaria',
  [PAYMENT_METHODS.QR]: 'QR Nequi/Daviplata',
  [PAYMENT_METHODS.CASH]: 'Efectivo contra entrega',
  tarjeta: 'Tarjeta de crédito/débito',
};

const OrderDetail = () => {
  const { id } = useParams();
  const { order, isLoading } = useOrderDetail(id);
  const invoiceRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
    documentTitle: `Factura-DonPalitoJr-${id}`,
  });

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
  const paymentMethod = order.paymentMethod || order.paymentResult?.method || '';
  const timeline = order.timeline || [];
  const statusColor = ORDER_STATUS_COLORS[order.status] || '#999999';

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
        {(order.status === 'paid' || order.status === 'delivered') && (
          <Button
            variant="ghost"
            size="sm"
            icon={<IoDownload size={16} />}
            onClick={handlePrint}
          >
            Descargar factura
          </Button>
        )}
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
                      className="w-16 h-16 rounded-lg object-cover"
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

      {/* ─── Factura imprimible (oculta en pantalla, visible al imprimir) ─── */}
      <div ref={invoiceRef} className="hidden print:block p-8 font-sans text-gray-800">
        {/* Encabezado */}
        <div className="flex items-start justify-between border-b-2 border-gray-800 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Don Palito Jr.</h1>
            <p className="text-sm text-gray-500">Cafetería & Tienda</p>
            <p className="text-sm text-gray-500">Cra 47 #76D Sur - 37, Sabaneta, Antioquia</p>
            <p className="text-sm text-gray-500">luchodonpalito@gmail.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold uppercase tracking-wide">Factura</h2>
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">N°:</span> {shortId}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Fecha:</span>{' '}
              {formatDate(order.createdAt, 'DD/MM/YYYY')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Estado:</span>{' '}
              {ORDER_STATUS_LABELS[order.status] || order.status}
            </p>
          </div>
        </div>

        {/* Datos del cliente / dirección */}
        {address && (
          <div className="mb-6">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-gray-500 mb-1">
              Datos de entrega
            </h3>
            <p className="text-sm font-medium">{address.fullName}</p>
            <p className="text-sm">{address.streetAddress}</p>
            <p className="text-sm">{address.city}</p>
            <p className="text-sm">Tel: {address.phoneNumber}</p>
          </div>
        )}

        {/* Tabla de productos */}
        <table className="w-full text-sm mb-6 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="text-left py-2 px-3 border border-gray-200">Producto</th>
              <th className="text-center py-2 px-3 border border-gray-200">Cant.</th>
              <th className="text-right py-2 px-3 border border-gray-200">Precio unit.</th>
              <th className="text-right py-2 px-3 border border-gray-200">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const name =
                item.product?.name || item.name || `Producto ${i + 1}`;
              const unitPrice = item.unitPrice || item.price || 0;
              return (
                <tr key={i} className={i % 2 === 0 ? '' : 'bg-gray-50'}>
                  <td className="py-2 px-3 border border-gray-200">{name}</td>
                  <td className="py-2 px-3 border border-gray-200 text-center">
                    {item.quantity}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-right">
                    {formatCurrency(unitPrice)}
                  </td>
                  <td className="py-2 px-3 border border-gray-200 text-right font-medium">
                    {formatCurrency(item.quantity * unitPrice)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end mb-6">
          <div className="w-56 text-sm space-y-1">
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
            <div className="border-t pt-1 flex justify-between font-bold text-base">
              <span>TOTAL</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="mb-8">
          <p className="text-sm text-gray-500">
            <span className="font-medium">Método de pago:</span>{' '}
            {PAYMENT_LABELS[paymentMethod] || paymentMethod || '—'}
          </p>
        </div>

        {/* Footer */}
        <div className="border-t pt-4 text-center text-xs text-gray-400">
          <p>¡Gracias por tu compra en Don Palito Jr.!</p>
          <p>Este documento es un comprobante de tu pedido. Generado el {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
