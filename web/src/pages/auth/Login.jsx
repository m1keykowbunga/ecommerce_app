import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IoEye, IoEyeOff, IoMail, IoLockClosed } from 'react-icons/io5';
import { SignIn } from '@clerk/clerk-react';
import { loginSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import logoColor from '../../assets/images/logo-color.png';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Mock login page
const MockLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const success = await login(data.email, data.password);
    if (success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <img src="https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/40" />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img src={logoColor} alt="Don Palito Jr" className="h-48 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white">Iniciar Sesión</h1>
            <p className="text-white/70 mt-2">Bienvenido de vuelta</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              icon={<IoMail size={20} />}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? 'text' : 'password'}
                placeholder="Tu contraseña"
                icon={<IoLockClosed size={20} />}
                error={errors.password?.message}
                required
                {...register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link
                to="/recuperar-password"
                className="text-sm text-white/80 hover:text-white underline"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
            >
              Iniciar Sesión
            </Button>
          </form>

          <p className="text-center text-white/70 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-white font-semibold hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  if (clerkKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <img src="https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full flex justify-center">
          <SignIn
          routing="hash"
          signUpUrl="/registro"
          afterSignInUrl="/post-login"
          appearance={{
            layout: {
              logoImageUrl: logoColor,
              logoLinkUrl: '/',
            },
            variables: {
              colorInputBackground: '#FAF4EC',
            },
            elements: {
              headerTitle: { display: 'none' },
              logoBox: { height: '120px', justifyContent: 'center', marginBottom: '4px' },
              logoImage: { height: '120px', width: 'auto', maxWidth: 'none' },
              card: {
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
              },
              socialButtonsBlockButton: {
                backgroundColor: 'rgba(255, 255, 255, 0.90)',
                color: '#5B3A29',
                border: 'none',
              },
              formFieldOptionalLabel: { display: 'none' },
            },
          }}
          />
        </div>
      </div>
    );
  }
  return <MockLogin />;
};

export default Login;
