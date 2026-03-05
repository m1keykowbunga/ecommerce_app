import { SignIn } from '@clerk/clerk-react';
import logoColor from '../../assets/images/logo-color.png';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden bg-white">
      <img
        src="https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'blur(2px)', transform: 'scale(1.03)', opacity: 0.75 }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.20)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />
      <div className="relative z-10 w-full flex justify-center">
        <SignIn
          routing="hash"
          afterSignInUrl="/"
          appearance={{
            layout: {
              logoImageUrl: logoColor,
              logoLinkUrl: '/',
            },
            variables: {
              colorInputBackground: '#F9FAFB',
            },
            elements: {
              headerTitle: { display: 'none' },
              logoBox: { height: '120px', justifyContent: 'center', marginBottom: '4px' },
              logoImage: { height: '120px', width: 'auto', maxWidth: 'none' },
              card: {
                backgroundColor: 'rgba(255, 255, 255, 0.88)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              },
              socialButtonsBlockButton: {
                backgroundColor: '#F3F4F6',
                color: '#5B3A29',
                border: '1px solid #E5E7EB',
              },
              formFieldOptionalLabel: { display: 'none' },
              otpCodeFieldInput: {
                backgroundColor: '#FAF4EC',
                border: '2px solid #C34928',
                borderRadius: '8px',
                color: '#5B3A29',
                fontWeight: '700',
                fontSize: '20px',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Login;