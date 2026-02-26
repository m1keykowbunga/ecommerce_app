import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@donpalitojr.com';

/**
 * AuthProvider — wrapper vacío para compatibilidad.
 * La autenticación real la maneja Clerk a través de ClerkProvider en App.jsx
 */
export const AuthProvider = ({ children }) => children;

/**
 * useAuth — expone la misma interfaz que el resto de la app espera.
 * Internamente usa los hooks de Clerk.
 */
export const useAuth = () => {
  const { user, isLoaded } = useUser();
  const { signOut, sessionClaims } = useClerkAuth();

  // Detecta admin via sessionClaims.role (Clerk JWT template),
  // publicMetadata.role, o email admin en VITE_ADMIN_EMAIL (dev)
  const isAdmin =
    sessionClaims?.role === 'admin' ||
    user?.publicMetadata?.role === 'admin' ||
    user?.primaryEmailAddress?.emailAddress === ADMIN_EMAIL;

  return {
    user: user
      ? {
          name: user.fullName || user.firstName || '',
          email: user.primaryEmailAddress?.emailAddress || '',
          imageUrl: user.imageUrl || '',
          id: user.id,
          role: isAdmin ? 'admin' : 'user',
        }
      : null,
    loading: !isLoaded,
    isAuthenticated: !!user,
    isAdmin,
    logout: () => signOut({ redirectUrl: '/' }),
    // updateProfile es no-op — el perfil se maneja desde Clerk dashboard o perfil de Clerk
    updateProfile: async () => {},
  };
};
