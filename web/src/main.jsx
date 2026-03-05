import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { esES } from '@clerk/localizations';
import App from './App.jsx';
import './styles/globals.css';

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const root = ReactDOM.createRoot(document.getElementById('root'));

if (CLERK_KEY) {
  root.render(
    <StrictMode>
      <ClerkProvider publishableKey={CLERK_KEY} localization={esES}>
        <App />
      </ClerkProvider>
    </StrictMode>
  );
} else {
  // Modo desarrollo sin Clerk
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}