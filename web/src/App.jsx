import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider } from '@clerk/clerk-react';
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

// Public pages
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import NotFound from './pages/NotFound';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PostLogin from './pages/auth/PostLogin';

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
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5173';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
});

// Redirige al panel admin externo
const AdminRedirect = () => {
  window.location.href = ADMIN_URL;
  return null;
};

function AppRoutes() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            <Route path="/" element={<Layout />}>
              {/* Públicas */}
              <Route index element={<Home />} />
              <Route path="catalogo" element={<Catalog />} />
              <Route path="producto/:id" element={<ProductDetail />} />
              <Route path="carrito" element={<Cart />} />

              {/* Auth */}
              <Route path="login" element={<Login />} />
              <Route path="post-login" element={<PostLogin />} />
              <Route path="registro" element={<Register />} />
              <Route path="recuperar-password" element={<ForgotPassword />} />
              <Route path="restablecer-password/:token" element={<ResetPassword />} />

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

            {/* Admin → redirige al proyecto admin externo */}
            <Route path="admin/*" element={<AdminRedirect />} />

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
  );
}

function App() {
  if (!CLERK_KEY) {
    // Sin Clerk key — modo desarrollo sin auth
    return (
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
      </QueryClientProvider>
    );
  }

  return (
    <ClerkProvider
      publishableKey={CLERK_KEY}
      localization={{
        signIn: {
          start: {
            subtitle: 'Inicia sesión para continuar',
            actionText: '¿No tienes una cuenta?',
            actionLink: 'Regístrate',
          },
        },
        signUp: {
          start: {
            subtitle: 'Crea tu cuenta en Don Palito Jr.',
            actionText: '¿Ya tienes una cuenta?',
            actionLink: 'Inicia sesión',
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        {/* Sincroniza el getter de token de Clerk con el interceptor de axios */}
        <ClerkTokenSync />
        <AppRoutes />
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
