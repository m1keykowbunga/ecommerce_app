import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IoMail, IoCheckmarkCircle } from 'react-icons/io5';
import { forgotPasswordSchema } from '../../utils/validationSchemas';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ForgotPassword = () => {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const onSubmit = async () => {
    // Mock: simular envío
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
  };

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <IoCheckmarkCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-brand-secondary mb-2">
              Email enviado
            </h2>
            <p className="text-gray-500 mb-6">
              Si el email existe en nuestra base de datos, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Volver al inicio de sesión
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-secondary">Recuperar Contraseña</h1>
            <p className="text-gray-500 mt-2">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
            >
              Enviar enlace
            </Button>
          </form>

          <p className="text-center text-gray-500 mt-6">
            <Link to="/login" className="text-brand-primary font-semibold hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
