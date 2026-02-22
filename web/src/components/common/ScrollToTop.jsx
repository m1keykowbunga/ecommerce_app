import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { IoArrowUp } from 'react-icons/io5';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const [showButton, setShowButton] = useState(false);

  // Auto-scroll en cambio de ruta
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  // Mostrar/ocultar botón flotante
  useEffect(() => {
    const handleScroll = () => {
      setShowButton(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!showButton) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg transition-all hover:bg-brand-secondary hover:shadow-xl active:scale-95"
      aria-label="Volver arriba"
    >
      <IoArrowUp size={22} />
    </button>
  );
};

export default ScrollToTop;
