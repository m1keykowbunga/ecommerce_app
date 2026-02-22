import { IoLocation, IoCreate, IoTrash } from 'react-icons/io5';
import Badge from '../common/Badge';

const AddressCard = ({ address, onEdit, onDelete }) => {
  return (
    <div className="bg-white border rounded-lg p-4 relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <IoLocation className="text-brand-primary mt-1 flex-shrink-0" size={20} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold">{address.label}</span>
              {address.isDefault && <Badge variant="primary" size="sm">Principal</Badge>}
            </div>
            <p className="text-sm text-gray-700">{address.fullName}</p>
            <p className="text-sm text-gray-500">{address.streetAddress}</p>
            <p className="text-sm text-gray-500">{address.city}</p>
            <p className="text-sm text-gray-500">Tel: {address.phoneNumber}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="text-gray-400 hover:text-brand-primary transition-colors"
            title="Editar"
          >
            <IoCreate size={18} />
          </button>
          <button
            onClick={() => onDelete(address.id)}
            className="text-gray-400 hover:text-red-500 transition-colors"
            title="Eliminar"
          >
            <IoTrash size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddressCard;
