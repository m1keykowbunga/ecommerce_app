import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import App from './App.jsx';
import './styles/globals.css';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Si falta la clave, lanzamos un error claro en la consola para saber qué pasa
if (!CLERK_KEY) {
  console.error("⚠️ Error: VITE_CLERK_PUBLISHABLE_KEY no está definida.");
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_KEY} 
      localization={esES}
      // Esto ayuda a Clerk a saber dónde está parado en producción
      afterSignInUrl="/"
      afterSignUpUrl="/"
    >
      <App />
    </ClerkProvider>
  </StrictMode>
);