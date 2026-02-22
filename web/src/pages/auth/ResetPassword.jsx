import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { IoEye, IoEyeOff, IoLockClosed, IoCheckmarkCircle } from 'react-icons/io5';
import { resetPasswordSchema } from '../../utils/validationSchemas';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const ResetPassword = () => {
  const { token } = useParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(resetPasswordSchema),
  });

  const onSubmit = async () => {
    // Mock: simular restablecimiento con token
    await new Promise((r) => setTimeout(r, 1000));
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <IoCheckmarkCircle className="mx-auto text-green-500 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-brand-secondary mb-2">
              Contraseña restablecida
            </h2>
            <p className="text-gray-500 mb-6">
              Tu contraseña ha sido actualizada exitosamente.
            </p>
            <Link to="/login">
              <Button variant="primary" fullWidth>
                Iniciar sesión
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
            <h1 className="text-3xl font-bold text-brand-secondary">Nueva Contraseña</h1>
            <p className="text-gray-500 mt-2">Ingresa tu nueva contraseña.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Input
                label="Nueva contraseña"
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

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={isSubmitting}
            >
              Restablecer contraseña
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
