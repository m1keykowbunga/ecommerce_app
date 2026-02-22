import { Link } from 'react-router-dom';
import { IoCartOutline } from 'react-icons/io5';
import Button from '../common/Button';

const EmptyCart = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <IoCartOutline className="text-gray-300 mb-6" size={120} />
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">
        Tu carrito está vacío
      </h2>
      <p className="text-gray-500 mb-8">
        Agrega productos de nuestro catálogo
      </p>
      <Link to="/catalogo">
        <Button variant="primary" size="lg">
          Ver Catálogo
        </Button>
      </Link>
    </div>
  );
};

export default EmptyCart;
