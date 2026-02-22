import { Link } from 'react-router-dom';
import { IoCart, IoMenu, IoClose, IoSearch, IoPerson } from 'react-icons/io5';
import { useState } from 'react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Simular usuario (después conectarás con AuthContext)
  const user = null; // o useAuth()
  const cartItemsCount = 3; // o useCart()

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Buscar:', searchQuery);
    // Aquí implementarás la búsqueda
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-40">
      <div className="container-custom">
        {/* Barra superior */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-primary rounded-full w-12 h-12 flex items-center justify-center">
              <span className="text-white font-bold text-xl">DP</span>
            </div>
            <div className="ml-3">
              <h1 className="text-xl font-bold text-gray-900">Don Palito Jr</h1>
              <p className="text-xs text-gray-500">Sabor tradicional</p>
            </div>
          </Link>

          {/* Barra de búsqueda - Desktop */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-xl mx-8"
          >
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:border-primary"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary"
              >
                <IoSearch size={24} />
              </button>
            </div>
          </form>

          {/* Acciones - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-ghost btn-circle">
                  <IoPerson size={24} />
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-lg bg-white rounded-box w-52 mt-4">
                  <li><Link to="/perfil">Mi Perfil</Link></li>
                  <li><Link to="/perfil/pedidos">Mis Pedidos</Link></li>
                  <li><button onClick={() => console.log('Logout')}>Cerrar Sesión</button></li>
                </ul>
              </div>
            ) : (
              <Link to="/login" className="btn btn-ghost">
                Iniciar Sesión
              </Link>
            )}

            <Link to="/carrito" className="btn btn-ghost btn-circle relative">
              <IoCart size={24} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>

          {/* Menú hamburguesa - Mobile */}
          <button 
            className="md:hidden text-gray-700"
            onClick={toggleMobileMenu}
          >
            {mobileMenuOpen ? <IoClose size={28} /> : <IoMenu size={28} />}
          </button>
        </div>

        {/* Navegación - Desktop */}
        <nav className="hidden md:flex items-center gap-6 py-3 border-t">
          <Link to="/" className="text-gray-700 hover:text-primary font-medium">
            Inicio
          </Link>
          <Link to="/productos" className="text-gray-700 hover:text-primary font-medium">
            Productos
          </Link>
          <Link to="/sobre-nosotros" className="text-gray-700 hover:text-primary font-medium">
            Sobre Nosotros
          </Link>
          <Link to="/contacto" className="text-gray-700 hover:text-primary font-medium">
            Contacto
          </Link>
        </nav>
      </div>

      {/* Menú Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container-custom py-4">
            {/* Búsqueda mobile */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  <IoSearch size={20} />
                </button>
              </div>
            </form>

            {/* Navegación mobile */}
            <nav className="flex flex-col gap-3">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link 
                to="/productos" 
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Productos
              </Link>
              <Link 
                to="/sobre-nosotros" 
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sobre Nosotros
              </Link>
              <Link 
                to="/contacto" 
                className="text-gray-700 hover:text-primary font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              
              <div className="border-t pt-3 mt-3">
                {user ? (
                  <>
                    <Link 
                      to="/perfil" 
                      className="text-gray-700 hover:text-primary font-medium py-2 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <Link 
                      to="/perfil/pedidos" 
                      className="text-gray-700 hover:text-primary font-medium py-2 block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Mis Pedidos
                    </Link>
                    <button 
                      className="text-red-600 font-medium py-2 block w-full text-left"
                      onClick={() => {
                        console.log('Logout');
                        setMobileMenuOpen(false);
                      }}
                    >
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <Link 
                    to="/login" 
                    className="btn btn-primary w-full"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Iniciar Sesión
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
