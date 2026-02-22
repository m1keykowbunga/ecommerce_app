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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img src={logoColor} alt="Don Palito Jr" className="h-48 w-auto mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-brand-secondary">Crear Cuenta</h1>
            <p className="text-gray-500 mt-2">Únete a la familia Don Palito Jr.</p>
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
                <span className="label-text">
                  Acepto los{' '}
                  <Link to="/terminos-condiciones" className="text-brand-primary hover:underline">
                    términos y condiciones
                  </Link>
                </span>
              </label>
              {errors.terms && (
                <span className="text-error text-sm ml-1">{errors.terms.message}</span>
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

          <p className="text-center text-gray-500 mt-6">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-brand-primary font-semibold hover:underline">
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
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <SignUp
          routing="hash"
          signInUrl="/login"
          afterSignUpUrl="/post-login"
          appearance={{
            layout: {
              logoImageUrl: logoColor,
              logoLinkUrl: '/',
            },
            elements: {
              headerTitle: { display: 'none' },
              logoBox: { height: '120px', justifyContent: 'center', marginBottom: '4px' },
              logoImage: { height: '120px', width: 'auto', maxWidth: 'none' },
            },
          }}
        />
      </div>
    );
  }
  return <MockRegister />;
};

export default Register;
