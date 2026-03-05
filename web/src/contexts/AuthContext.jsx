import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

/**
 * AuthProvider — wrapper vacío para compatibilidad con componentes que lo consumen.
 * La autenticación real la maneja Clerk a través de ClerkProvider en main.jsx
 */
export const AuthProvider = ({ children }) => children;

/**
 * useAuth — expone la misma interfaz que el resto de la app espera.
 * Internamente usa los hooks de Clerk.
 */
export const useAuth = () => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  return {
    user: user
      ? {
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          imageUrl: user.imageUrl || '',
          id: user.id,
        }
      : null,
    loading: !isLoaded,
    isAuthenticated: !!user,
    logout: () => signOut({ redirectUrl: '/' }),
  };
};