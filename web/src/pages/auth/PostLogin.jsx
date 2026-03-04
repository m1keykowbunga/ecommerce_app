import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Loading from '../../components/common/Loading';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'estiwss@gmail.com';
const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "https://yaretzi-asbestous-jerrell.ngrok-free.dev/api"; // Asegúrate de que esta URL apunte a tu Admin, no a tu API

/**
 * Página intermedia post-login de Clerk.
 * Redirige a admin o a home según el rol del usuario.
 */
const PostLogin = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (user?.email === ADMIN_EMAIL || user?.role === 'admin') {
      window.location.href = ADMIN_URL;
    } else {
      navigate('/', { replace: true });
    }
  }, [user, loading, isAuthenticated, navigate]);

  return <Loading fullScreen />;
};

export default PostLogin;
