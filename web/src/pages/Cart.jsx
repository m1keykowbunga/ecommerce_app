import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoArrowBack, IoLockClosed, IoLogoWhatsapp } from 'react-icons/io5';
import { toast } from 'react-toastify';

import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/formatters';
import { IVA_RATE, CONTACT_INFO } from '../utils/constants';

const SHIPPING_COST = 10000;

import CartItem from '../components/cart/CartItem';
import OrderSummary from '../components/cart/OrderSummary';
import EmptyCart from '../components/cart/EmptyCart';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const Cart = () => {
  const { items, subtotal, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [includeShipping, setIncludeShipping] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const iva = Math.round(subtotal * IVA_RATE);
  const baseWithoutIva = subtotal - iva;
  const shipping = includeShipping ? SHIPPING_COST : 0;
  const total = subtotal + shipping;

  const handleCheckout = async (method) => {
  if (method === 'tarjeta') {
    const toastId = toast.loading("Redirigiendo a la pasarela segura...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }) // Pasamos los items del carrito
      });

      const data = await response.json();
      
      if (data.url) {
        // EL SALTO DEFINITIVO
        window.location.href = data.url;
      } else {
        throw new Error("No se pudo obtener la URL de pago");
      }
    } catch (error) {
      toast.update(toastId, { render: "Error al conectar con Stripe", type: "error", isLoading: false, autoClose: 3000 });
    }
  }
};

  const buildWhatsAppMessage = () => {
    let msg = '¡Hola! Me gustaría hacer el siguiente pedido:\n\n';
    items.forEach((item) => {
      const price = item.product.discount
        ? item.product.price * (1 - item.product.discount / 100)
        : item.product.price;
      msg += `- ${item.product.name} x${item.quantity} = ${formatCurrency(price * item.quantity)}\n`;
    });
    msg += `\nSubtotal (sin IVA): ${formatCurrency(baseWithoutIva)}`;
    msg += `\nIVA (19%): ${formatCurrency(iva)}`;
    if (includeShipping) msg += `\nEnvío: ${formatCurrency(shipping)}`;
    msg += `\n*Total: ${formatCurrency(total)}*`;
    return encodeURIComponent(msg);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyCart />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ... resto del JSX igual ... */}
      <Link
        to="/catalogo"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-primary mb-6 transition-colors"
      >
        <IoArrowBack size={16} />
        Volver al catálogo
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Mi Carrito</h1>
        <Badge variant="primary" size="sm">
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {items.map((item) => (
              <CartItem key={item.product._id || item.product.id} item={item} />
            ))}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 flex items-start gap-3">
            <IoLogoWhatsapp size={22} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">¿Prefieres pedir por WhatsApp?</p>
              <a
                href={`https://wa.me/${CONTACT_INFO.phone}?text=${buildWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-700 hover:underline"
              >
                Enviar pedido por WhatsApp →
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <OrderSummary
            baseWithoutIva={baseWithoutIva}
            couponDiscount={0}
            appliedCoupon={null}
            includeShipping={includeShipping}
            onToggleShipping={() => setIncludeShipping(!includeShipping)}
            shipping={shipping}
            iva={iva}
            total={total}
            onCheckout={handleCheckout}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      <Modal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} title="Inicia sesión para continuar" size="sm">
        <div className="space-y-4">
          <div className="flex justify-center py-2">
            <IoLockClosed size={48} className="text-brand-primary opacity-60" />
          </div>
          <p className="text-gray-600 text-center text-sm">
            Para proceder al pago necesitas tener una cuenta.
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <Link to="/login" state={{ from: { pathname: '/carrito' } }}>
              <Button variant="primary" fullWidth onClick={() => setShowLoginModal(false)}>
                Iniciar sesión
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Cart;