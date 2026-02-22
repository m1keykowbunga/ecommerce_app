import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { setTokenGetter } from '../../services/api';

/**
 * ClerkTokenSync — componente sin UI que sincroniza el getter
 * de tokens de Clerk con el interceptor de axios.
 * Debe estar dentro del árbol de <ClerkProvider>.
 */
const ClerkTokenSync = () => {
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(getToken);
    return () => setTokenGetter(null);
  }, [getToken]);

  return null;
};

export default ClerkTokenSync;
