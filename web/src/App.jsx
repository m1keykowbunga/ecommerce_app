import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Providers
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ClerkTokenSync from './components/providers/ClerkTokenSync';

// Layout
import Layout from './components/layout/Layout';

// Route guards
import ProtectedRoute from './components/auth/ProtectedRoute';

// Cookie banner
import CookieBanner from './components/common/CookieBanner';

// Scroll to top en cambio de ruta
import ScrollToTop from './components/common/ScrollToTop';

// Public pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

// Auth pages
import Login from './pages/auth/Login';

// Account inactive
import AccountInactive from './pages/AccountInactive';

// Info pages
import Contact from './pages/info/Contact';
import About from './pages/info/About';
import FAQ from './pages/info/FAQ';
import Terms from './pages/info/Terms';
import Privacy from './pages/info/Privacy';
import Cookies from './pages/info/Cookies';

// Protected pages
import Profile from './pages/profile/Profile';
import Orders from './pages/profile/Orders';
import OrderDetail from './pages/profile/OrderDetail';
import Wishlist from './pages/profile/Wishlist';
import Checkout from './pages/checkout/Checkout';
import CheckoutSuccess from './pages/checkout/CheckoutSuccess';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            {/* Sincroniza el token de Clerk con el interceptor de axios (solo si Clerk está activo) */}
            {CLERK_KEY && <ClerkTokenSync />}
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Públicas */}
                <Route index element={<Home />} />
                <Route path="catalogo" element={<Catalog />} />
                <Route path="producto/:id" element={<ProductDetail />} />
                <Route path="carrito" element={<Cart />} />

                {/* Auth */}
                <Route path="login" element={<Login />} />


                {/* Cuenta inactiva */}
                <Route path="cuenta-inactiva" element={<AccountInactive />} />

                {/* Info */}
                <Route path="contacto" element={<Contact />} />
                <Route path="sobre-nosotros" element={<About />} />
                <Route path="preguntas-frecuentes" element={<FAQ />} />
                <Route path="terminos-condiciones" element={<Terms />} />
                <Route path="politica-privacidad" element={<Privacy />} />
                <Route path="politica-cookies" element={<Cookies />} />

                {/* Protegidas */}
                <Route path="perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="perfil/favoritos" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                <Route path="perfil/pedidos" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                <Route path="perfil/pedidos/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
                <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="checkout/exito" element={<ProtectedRoute><CheckoutSuccess /></ProtectedRoute>} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <CookieBanner />

            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              theme="light"
            />
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;