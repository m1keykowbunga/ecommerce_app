import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Componente que se ejecuta después de que Clerk carga
 * para inicializar estado adicional si es necesario.
 * No renderiza nada visible — solo lógica de inicialización.
 */
const AuthInitializer = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    // Espacio para inicialización post-auth si se necesita en el futuro
    // (ej: cargar preferencias del usuario, sincronizar estado, etc.)
  }, [isAuthenticated, loading]);

  return children;
};

export default AuthInitializer;
