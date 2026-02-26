import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IoEye, IoEyeOff, IoMail, IoLockClosed, IoPerson } from 'react-icons/io5';
import { SignUp } from '@clerk/clerk-react';
import { registerSchema } from '../../utils/validationSchemas';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import logoColor from '../../assets/images/logo-color.png';

const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Mock register page
// Solo letras (incluyendo tildes y ñ), espacios permitidos
const noNumbers = (e) => {
  if (/\d/.test(e.key)) e.preventDefault();
};

const MockRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const success = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (success) {
      navigate('/', { replace: true });
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
            <h1 className="text-3xl font-bold text-white">Crear Cuenta</h1>
            <p className="text-white/70 mt-2">Únete a la familia Don Palito Jr.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nombre completo"
              placeholder="Tu nombre"
              icon={<IoPerson size={20} />}
              error={errors.name?.message}
              required
              onKeyDown={noNumbers}
              {...register('name')}
            />

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
                placeholder="Mínimo 8 caracteres"
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

            <div className="relative">
              <Input
                label="Confirmar contraseña"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite tu contraseña"
                icon={<IoLockClosed size={20} />}
                error={errors.confirmPassword?.message}
                required
                {...register('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-[42px] text-gray-400 hover:text-gray-600"
              >
                {showConfirm ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary checkbox-sm"
                  {...register('terms')}
                />
                <span className="label-text text-white/80">
                  Acepto los{' '}
                  <Link to="/terminos-condiciones" className="text-white hover:underline">
                    términos y condiciones
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <span className="text-red-300 text-sm ml-1">{errors.terms.message}</span>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
            >
              Crear Cuenta
            </Button>
          </form>

          <p className="text-center text-white/70 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-white font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const Register = () => {
  if (clerkKey) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8 relative overflow-hidden">
        <img src="https://res.cloudinary.com/diqoi03kk/image/upload/v1771179829/Comida-de-navidad-en-Colombia_rpr88g.jpg" alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 w-full flex justify-center">
          <SignUp
          routing="hash"
          signInUrl="/login"
          afterSignUpUrl="/post-login"
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
  return <MockRegister />;
};

export default Register;
