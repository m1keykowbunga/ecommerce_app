import { Link, useLocation } from 'react-router-dom';
import { IoCheckmarkCircle, IoLogoWhatsapp, IoReceiptOutline, IoStorefront } from 'react-icons/io5';
import Button from '../../components/common/Button';
import { CONTACT_INFO } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';

const CheckoutSuccess = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const paymentIntentId = location.state?.paymentIntentId;
  const total = location.state?.total;
  const paymentMethod = location.state?.paymentMethod;

  const handleWhatsApp = () => {
    const orderRef = orderId
      ? `#${orderId}`
      : paymentIntentId
        ? `(ref. ${paymentIntentId.slice(-8)})`
        : '';
    const totalText = total ? ` por ${formatCurrency(total)}` : '';
    const methodText = paymentMethod ? `. Método de pago: ${paymentMethod}` : '';
    const message = encodeURIComponent(
      `¡Hola Don Palito Jr! Acabo de realizar mi pedido ${orderRef}${totalText}${methodText}. ¡Gracias!`
    );
    window.open(`https://wa.me/${CONTACT_INFO.phone}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <IoCheckmarkCircle className="mx-auto text-green-500 mb-4" size={80} />

          <h1 className="text-3xl font-bold text-brand-secondary mb-2">
            ¡Pedido realizado!
          </h1>
          <p className="text-gray-500 mb-2">
            Tu pedido ha sido creado exitosamente.
          </p>

          {orderId && (
            <p className="text-lg font-semibold text-brand-primary mb-6">
              Número de pedido: <span className="font-mono text-sm">{orderId}</span>
            </p>
          )}

          {paymentIntentId && !orderId && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-green-700 font-medium">
                ✅ Pago con tarjeta procesado correctamente
              </p>
              <p className="text-xs text-green-600 mt-1">
                Tu pedido quedará registrado en breve. Puedes verlo en "Mis Pedidos".
              </p>
            </div>
          )}

          <p className="text-sm text-gray-400 mb-6">
            Recibirás actualizaciones sobre el estado de tu pedido.
          </p>

          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors mb-6"
          >
            <IoLogoWhatsapp size={22} />
            Confirmar por WhatsApp
          </button>

          <div className="space-y-3">
            <Link to="/perfil/pedidos">
              <Button variant="primary" fullWidth icon={<IoReceiptOutline size={18} />}>
                Ver mis pedidos
              </Button>
            </Link>
            <Link to="/catalogo">
              <Button variant="ghost" fullWidth icon={<IoStorefront size={18} />}>
                Seguir comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
