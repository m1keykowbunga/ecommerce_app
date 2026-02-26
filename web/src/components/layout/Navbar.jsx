import { Link, useLocation } from 'react-router-dom';
import { IoCart, IoPerson, IoMenu, IoClose, IoLogOut } from 'react-icons/io5';
import { useState, useEffect } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import logoColor from '../../assets/images/logo-color.png';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/', label: 'Inicio' },
    { to: '/catalogo', label: 'Productos' },
    { to: '/sobre-nosotros', label: 'Sobre Nosotros' },
    { to: '/contacto', label: 'Contacto' },
  ];

  const isActive = (path) => location.pathname === path;

  // Cerrar menú móvil al hacer scroll
  // Delay de 150ms para ignorar el micro-scroll que genera el tap del botón
  useEffect(() => {
    if (!open) return;
    let handleScroll;
    const timer = setTimeout(() => {
      handleScroll = () => setOpen(false);
      window.addEventListener('scroll', handleScroll, { passive: true });
    }, 150);
    return () => {
      clearTimeout(timer);
      if (handleScroll) window.removeEventListener('scroll', handleScroll);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-ui-border backdrop-blur-nav shadow-sm">
      <div className="container mx-auto px-4">
        <div className="relative flex h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={logoColor}
              alt="Don Palito Jr"
              className="h-16 w-auto transition-transform group-hover:scale-105"
            />
          </Link>

          {/* Nav Desktop — centrado absoluto */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? 'text-brand-primary font-semibold'
                    : 'text-text-secondary hover:text-brand-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Cart */}
            <Link to="/carrito" className="relative group">
              <div className="p-2 hover:bg-brand-primary/5 rounded-lg transition-colors">
                <IoCart className="h-7 w-7 text-text-secondary group-hover:text-brand-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -right-1 -top-1 h-5 w-5 rounded-full bg-brand-accent text-white text-xs font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </Link>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/perfil">
                  <button className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-brand-primary/5 transition-colors">
                    <IoPerson className="h-5 w-5 text-brand-primary" />
                    <span className="hidden sm:inline text-sm font-medium text-text-primary">
                      {user.name?.split(' ')[0] || user.nombre?.split(' ')[0]}
                    </span>
                  </button>
                </Link>
                <button
                  onClick={logout}
                  title="Cerrar sesión"
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
                >
                  <IoLogOut className="h-5 w-5 text-text-secondary group-hover:text-red-600 transition-colors" />
                </button>
              </div>
            ) : (
              <Link to="/login">
                <Button className="bg-brand-primary text-white hover:bg-brand-secondary">
                  Iniciar Sesión
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-2 hover:bg-brand-primary/5 rounded-lg transition-colors"
            >
              {open ? (
                <IoClose className="h-6 w-6 text-text-primary" />
              ) : (
                <IoMenu className="h-6 w-6 text-text-primary" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {open && (
        <nav className="border-t border-ui-border bg-white p-4 md:hidden animate-fade-in shadow-lg">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block py-3 text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'text-brand-primary font-semibold'
                  : 'text-text-secondary hover:text-brand-primary'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
