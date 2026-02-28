// src/components/providers/ClerkTokenSync.jsx
import { useAuth } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { setTokenGetter } from '../../services/api'; // Importa la función que viste "atravesada"

const ClerkTokenSync = () => {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      console.log("✅ ClerkTokenSync: Sincronizando token con API");
      // Aquí es donde "enchufas" Clerk a tu archivo api.js
      setTokenGetter(getToken);
    } else {
      setTokenGetter(null);
    }
  }, [getToken, isSignedIn]);

  return null;
};

export default ClerkTokenSync;