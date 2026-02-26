import { Link } from 'react-router-dom';
import { IoMailOutline, IoLogoWhatsapp } from 'react-icons/io5';
import Button from '../components/common/Button';

const AccountInactive = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl shadow-md p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>

          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Cuenta desactivada
          </h1>
          <p className="text-text-secondary mb-6">
            Tu cuenta ha sido desactivada por un administrador. Si crees que
            esto es un error, por favor comunícate con nuestro soporte.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href="mailto:donpalitojr@gmail.com"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ui-border text-text-secondary hover:border-brand-primary hover:text-brand-primary transition-colors"
            >
              <IoMailOutline size={20} />
              donpalitojr@gmail.com
            </a>

            <a
              href="https://wa.me/573001234567"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-ui-border text-text-secondary hover:border-green-500 hover:text-green-600 transition-colors"
            >
              <IoLogoWhatsapp size={20} />
              Contactar por WhatsApp
            </a>
          </div>

          <div className="mt-6 pt-6 border-t border-ui-border">
            <Link to="/">
              <Button variant="ghost" size="sm">
                Volver al inicio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountInactive;
