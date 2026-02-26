import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { addressService, couponService, paymentService } from '../../services/index';
import { IVA_RATE } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import { getProductImage } from '../../utils/productHelpers';
import CheckoutStepper from '../../components/checkout/CheckoutStepper';
import PaymentMethodSelector from '../../components/checkout/PaymentMethodSelector';
import StripeCheckoutForm from '../../components/checkout/StripeCheckoutForm';
import AddressForm from '../../components/profile/AddressForm';
import Button from '../../components/common/Button';

const SHIPPING_COST = 10000;

const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

const Checkout = () => {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  // El método de pago puede venir pre-seleccionado desde el carrito
  const preselectedMethod = location.state?.paymentMethod || '';

  const [step, setStep] = useState(0);
  const [includeShipping, setIncludeShipping] = useState(false);

  // Cupón
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Dirección
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddress, setShowNewAddress] = useState(false);

  // Pago
  const [paymentMethod, setPaymentMethod] = useState(preselectedMethod);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Cargar direcciones al montar
  useEffect(() => {
    addressService.getAddresses()
      .then((data) => {
        const list = data?.addresses || data || [];
        setAddresses(list);
        const def = list.find((a) => a.isDefault);
        if (def) setSelectedAddressId(def._id || def.id);
      })
      .catch(() => setAddresses([]))
      .finally(() => setAddressLoading(false));
  }, []);

  // Si viene método preseleccionado, ir directo al step de dirección
  useEffect(() => {
    if (preselectedMethod) setStep(1);
  }, [preselectedMethod]);

  // Calcular totales
  const discount = couponData?.discountAmount ?? 0;
  const discountedSubtotal = subtotal - discount;
  const iva = Math.round(discountedSubtotal * IVA_RATE / (1 + IVA_RATE));
  const baseWithoutIva = discountedSubtotal - iva;
  const shipping = includeShipping ? SHIPPING_COST : 0;
  const total = discountedSubtotal + shipping;

  if (items.length === 0) {
    navigate('/carrito');
    return null;
  }

  // --- Helpers ---

  // Construye los cartItems para POST /api/payment/create-intent
  const buildCartItems = () =>
    items.map((i) => ({
      product: { _id: i.product._id || i.product.id },
      quantity: i.quantity,
    }));

  const getSelectedAddress = () =>
    addresses.find((a) => (a._id || a.id) === selectedAddressId);

  // --- Handlers ---

  const handleCouponValidate = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const data = await couponService.validate(couponCode.trim().toUpperCase(), subtotal);
      if (data.discountAmount != null) {
        const coupon = data.coupon || {};
        const label = coupon.discountType === 'percentage'
          ? `${coupon.discountValue}% de descuento`
          : formatCurrency(coupon.discountValue ?? data.discountAmount);
        setCouponData({
          discountAmount: data.discountAmount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          description: coupon.code || couponCode,
          label,
        });
        toast.success(`Cupón aplicado: ${label}`);
      } else {
        setCouponError(data.message || data.error || 'Cupón inválido o expirado');
      }
    } catch (err) {
      if (err?.response?.status === 404 || !err?.response) {
        setCouponError('Cupones no disponibles por el momento');
      } else {
        const msg = err?.response?.data?.error || 'Cupón inválido o expirado';
        setCouponError(msg);
        toast.error(msg);
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleNewAddress = async (data) => {
    try {
      const res = await addressService.addAddress(data);
      const newAddr = res?.address || res;
      setAddresses((prev) => [...prev, newAddr]);
      setSelectedAddressId(newAddr._id || newAddr.id);
      setShowNewAddress(false);
      toast.success('Dirección agregada');
    } catch {
      toast.error('Error al guardar la dirección');
    }
  };

  // Pago con Stripe: crear PaymentIntent → el webhook crea la orden automáticamente
  const handleInitStripe = async () => {
    setProcessing(true);
    try {
      const data = await paymentService.createPaymentIntent(
        buildCartItems(),
        getSelectedAddress(),
        couponData ? couponCode : undefined
      );
      setClientSecret(data.clientSecret);
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error al inicializar el pago con Stripe');
    } finally {
      setProcessing(false);
    }
  };

  // Stripe exitoso: el webhook ya creó la orden — solo limpiar y navegar
  const handleStripeSuccess = (paymentIntent) => {
    clearCart();
    // Pasamos el paymentIntentId; cuando el usuario vea la confirmación,
    // la orden ya existe en MongoDB creada por el webhook.
    navigate('/checkout/exito', { state: { paymentIntentId: paymentIntent.id, total, paymentMethod: 'tarjeta' } });
  };

  // Métodos no-Stripe (transferencia): POST /payment/create-transfer-order
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const res = await paymentService.createTransferOrder(
        buildCartItems(),
        getSelectedAddress(),
        couponData ? couponCode : undefined
      );
      const orderId = res?.order?._id || res?.order?.id || res?._id;
      clearCart();
      navigate('/checkout/exito', { state: { orderId, total, paymentMethod } });
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Error al crear el pedido. Intenta de nuevo.');
    } finally {
      setProcessing(false);
    }
  };

  const canProceedStep2 = !!selectedAddressId;
  const canProceedStep3 = !!paymentMethod;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-2">Checkout</h1>
      <CheckoutStepper currentStep={step} />

      {/* ── Step 0: Resumen ── */}
      {step === 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Resumen del pedido</h2>

          <div className="space-y-3 mb-6">
            {items.map((item) => {
              const price = item.product.discount
                ? Math.round(item.product.price * (1 - item.product.discount / 100))
                : item.product.price;
              return (
                <div key={item.product._id || item.product.id} className="flex items-center gap-3">
                  <img
                    src={getProductImage(item.product)}
                    alt={item.product.name}
                    className="w-12 h-12 rounded-lg object-contain bg-base-200"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.product.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.quantity} × {formatCurrency(price)}
                    </p>
                  </div>
                  <span className="font-semibold text-sm">{formatCurrency(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Envío */}
          <div className="form-control mb-4">
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="checkbox"
                className="checkbox checkbox-primary checkbox-sm"
                checked={includeShipping}
                onChange={(e) => setIncludeShipping(e.target.checked)}
              />
              <span className="label-text">Incluir envío ({formatCurrency(SHIPPING_COST)})</span>
            </label>
          </div>

          {/* Cupón */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="Código de cupón"
              value={couponCode}
              onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
              disabled={!!couponData}
              className="input input-bordered flex-1 text-sm"
            />
            {couponData ? (
              <Button variant="ghost" size="sm" onClick={() => { setCouponData(null); setCouponCode(''); }}>
                Quitar
              </Button>
            ) : (
              <Button variant="primary" size="sm" onClick={handleCouponValidate} loading={couponLoading}>
                Aplicar
              </Button>
            )}
          </div>
          {couponError && <p className="text-error text-sm mb-3">{couponError}</p>}
          {couponData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
              ✅ {couponData.description} — {couponData.label} aplicado
            </div>
          )}

          {/* Desglose */}
          <div className="border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Base (sin IVA)</span>
              <span>{formatCurrency(baseWithoutIva)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>IVA (19%)</span>
              <span>{formatCurrency(iva)}</span>
            </div>
            {couponData && (
              <div className="flex justify-between text-green-600">
                <span>Descuento ({couponData.label})</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            {includeShipping && (
              <div className="flex justify-between text-gray-500">
                <span>Envío</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2">
              <span>Total</span>
              <span className="text-brand-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              icon={<IoArrowForward size={18} />}
              iconPosition="right"
              onClick={() => setStep(1)}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 1: Dirección ── */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Dirección de envío</h2>

          {addressLoading ? (
            <div className="flex items-center gap-2 text-gray-500 py-4">
              <span className="loading loading-spinner loading-sm" />
              <span>Cargando direcciones...</span>
            </div>
          ) : (
            <>
              {addresses.length > 0 && !showNewAddress && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr._id || addr.id}
                      className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        selectedAddressId === (addr._id || addr.id)
                          ? 'border-brand-primary bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        checked={selectedAddressId === (addr._id || addr.id)}
                        onChange={() => setSelectedAddressId(addr._id || addr.id)}
                        className="radio radio-primary mt-1"
                      />
                      <div>
                        <p className="font-medium">{addr.label} — {addr.fullName}</p>
                        <p className="text-sm text-gray-500">{addr.streetAddress}, {addr.city}</p>
                        <p className="text-sm text-gray-500">Tel: {addr.phoneNumber}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {addresses.length === 0 && !showNewAddress && (
                <p className="text-gray-500 text-sm mb-4">
                  No tienes direcciones guardadas. Agrega una para continuar.
                </p>
              )}

              {showNewAddress ? (
                <AddressForm
                  onSubmit={handleNewAddress}
                  onCancel={addresses.length > 0 ? () => setShowNewAddress(false) : undefined}
                />
              ) : (
                <Button variant="ghost" size="sm" onClick={() => setShowNewAddress(true)}>
                  + Agregar nueva dirección
                </Button>
              )}
            </>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="ghost" icon={<IoArrowBack size={18} />} onClick={() => setStep(0)}>
              Atrás
            </Button>
            <Button
              variant="primary"
              icon={<IoArrowForward size={18} />}
              iconPosition="right"
              onClick={() => setStep(2)}
              disabled={!canProceedStep2}
            >
              Continuar
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Método de pago ── */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Método de pago</h2>

          <PaymentMethodSelector
            selected={paymentMethod}
            onChange={(method) => {
              setPaymentMethod(method);
              setClientSecret(null);
            }}
          />

          {/* Formulario Stripe — solo cuando hay clientSecret */}
          {paymentMethod === 'tarjeta' && clientSecret && stripePromise && (
            <div className="mt-6 p-4 border border-brand-primary/20 rounded-xl bg-brand-primary/5">
              <p className="text-sm text-brand-secondary font-medium mb-4">
                Ingresa los datos de tu tarjeta:
              </p>
              <Elements stripe={stripePromise} options={{ clientSecret, locale: 'es' }}>
                <StripeCheckoutForm
                  onSuccess={handleStripeSuccess}
                  onError={(err) => toast.error(err.message || 'Error al procesar el pago')}
                />
              </Elements>
            </div>
          )}

          {/* Total */}
          <div className="border-t mt-6 pt-4">
            <div className="flex justify-between font-bold text-lg mb-4">
              <span>Total a pagar</span>
              <span className="text-brand-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" icon={<IoArrowBack size={18} />} onClick={() => setStep(1)}>
              Atrás
            </Button>

            {/* Transferencia bancaria */}
            {paymentMethod !== 'tarjeta' && (
              <Button
                variant="primary"
                onClick={handleConfirm}
                loading={processing}
                disabled={!canProceedStep3}
              >
                Confirmar pedido
              </Button>
            )}

            {/* Tarjeta Stripe: primer clic obtiene clientSecret */}
            {paymentMethod === 'tarjeta' && !clientSecret && (
              <Button
                variant="primary"
                onClick={handleInitStripe}
                loading={processing}
                disabled={!canProceedStep3 || !stripePromise}
              >
                Continuar con Stripe
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
