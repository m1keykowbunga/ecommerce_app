import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { STORAGE_KEYS } from '../../utils/constants';

const CookieBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(STORAGE_KEYS.cookiesAccepted);
    if (!accepted) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(STORAGE_KEYS.cookiesAccepted, 'true');
    setVisible(false);
  };

  const handleReject = () => {
    localStorage.setItem(STORAGE_KEYS.cookiesAccepted, 'false');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl border p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            Utilizamos cookies para mejorar tu experiencia en nuestro sitio.{' '}
            <Link to="/politica-cookies" className="text-brand-primary hover:underline">
              Más información
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Rechazar
          </button>
          <button
            onClick={handleAccept}
            className="px-4 py-2 text-sm bg-brand-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
