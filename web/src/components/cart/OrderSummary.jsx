import { Link } from 'react-router-dom';
import { IoCard, IoSwapHorizontal, IoLockClosed } from 'react-icons/io5';
import { formatCurrency } from '../../utils/formatters';
import Button from '../common/Button';
import Card from '../common/Card';

const OrderSummary = ({
  baseWithoutIva,
  couponDiscount,
  appliedCoupon,
  includeShipping,
  onToggleShipping,
  shipping,
  iva,
  total,
  onCheckout,
  isAuthenticated,
}) => {
  return (
    <div className="sticky top-24">
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Resumen del Pedido
        </h2>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal (sin IVA)</span>
            <span className="font-medium">{formatCurrency(baseWithoutIva)}</span>
          </div>

          {appliedCoupon && couponDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Cupón ({appliedCoupon.code})</span>
              <span>-{formatCurrency(couponDiscount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-gray-600">IVA (19%)</span>
            <span className="font-medium">{formatCurrency(iva)}</span>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-sm checkbox-primary"
                checked={includeShipping}
                onChange={onToggleShipping}
              />
              <span className="text-gray-600">Envío a domicilio</span>
            </label>
            <span className="font-medium">
              {includeShipping ? formatCurrency(shipping) : '-'}
            </span>
          </div>

          <div className="divider my-1"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span className="text-brand-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {isAuthenticated ? (
            <>
              {/* Pagar con tarjeta (Stripe) */}
              <Button
                variant="primary"
                fullWidth
                icon={<IoCard size={18} />}
                onClick={() => onCheckout('tarjeta')}
              >
                Pagar con tarjeta
              </Button>

              {/* Transferencia bancaria */}
              <Button
                variant="primary"
                outline
                fullWidth
                icon={<IoSwapHorizontal size={18} />}
                onClick={() => onCheckout('otros')}
              >
                Pagar por transferencia
              </Button>
            </>
          ) : (
            /* No autenticado */
            <Button
              variant="primary"
              fullWidth
              onClick={() => onCheckout(null)}
            >
              <span className="flex items-center justify-center gap-2">
                <IoLockClosed size={16} />
                Iniciar sesión para pagar
              </span>
            </Button>
          )}

          <Link
            to="/catalogo"
            className="block text-center text-sm text-brand-primary hover:underline"
          >
            Seguir Comprando
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default OrderSummary;
