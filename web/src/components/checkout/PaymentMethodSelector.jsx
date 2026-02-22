import { IoCash, IoQrCode, IoSwapHorizontal, IoCard } from 'react-icons/io5';
import { BANK_INFO } from '../../utils/constants';

const methods = [
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    icon: <IoSwapHorizontal size={24} />,
    description: 'Paga directamente a nuestra cuenta',
  },
  {
    id: 'qr',
    label: 'QR Nequi / Daviplata',
    icon: <IoQrCode size={24} />,
    description: 'Escanea el código QR para pagar',
  },
  {
    id: 'efectivo',
    label: 'Efectivo contra entrega',
    icon: <IoCash size={24} />,
    description: 'Paga al recibir tu pedido',
  },
  {
    id: 'tarjeta',
    label: 'Tarjeta de crédito/débito',
    icon: <IoCard size={24} />,
    description: 'Paga de forma segura con Stripe',
  },
];

const PaymentMethodSelector = ({ selected, onChange }) => {
  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <label
          key={method.id}
          className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
            selected === method.id
              ? 'border-brand-primary bg-orange-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <input
            type="radio"
            name="paymentMethod"
            value={method.id}
            checked={selected === method.id}
            onChange={() => onChange(method.id)}
            className="radio radio-primary mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-brand-primary">{method.icon}</span>
              <span className="font-semibold">{method.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{method.description}</p>
          </div>
        </label>
      ))}

      {/* Datos bancarios para transferencia */}
      {selected === 'transferencia' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-3">
          <h4 className="font-semibold text-blue-800 mb-2">Datos bancarios</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p><span className="font-medium">Banco:</span> {BANK_INFO.banco}</p>
            <p><span className="font-medium">Titular:</span> {BANK_INFO.titular}</p>
            <p><span className="font-medium">Cuenta:</span> {BANK_INFO.numero}</p>
            <p><span className="font-medium">Tipo:</span> {BANK_INFO.tipo}</p>
          </div>
        </div>
      )}

      {/* Aviso para tarjeta */}
      {selected === 'tarjeta' && (
        <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-4 mt-3">
          <p className="text-sm text-brand-secondary">
            🔒 Tu pago es procesado de forma segura por <strong>Stripe</strong>.
            Al continuar, se te solicitarán los datos de tu tarjeta.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;
