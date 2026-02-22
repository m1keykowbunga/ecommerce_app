import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-brand-primary opacity-30">404</h1>
        <h2 className="text-3xl font-bold text-brand-secondary mt-4 mb-2">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link to="/">
            <Button variant="primary">Volver al inicio</Button>
          </Link>
          <Link to="/catalogo">
            <Button variant="ghost">Ver catálogo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
