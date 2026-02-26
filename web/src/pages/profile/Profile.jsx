import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { IoPersonCircle, IoLocation, IoLockClosed, IoTrash, IoAdd, IoReceiptOutline, IoHeartOutline } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { profileSchema, changePasswordSchema } from '../../utils/validationSchemas';
import useAddresses from '../../hooks/useAddresses';
import useProfile from '../../hooks/useProfile';
import AddressForm from '../../components/profile/AddressForm';
import AddressCard from '../../components/profile/AddressCard';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

const noNumbers = (e) => {
  if (/\d/.test(e.key)) e.preventDefault();
};

const onlyNumbers = (e) => {
  if (!/[\d]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
    e.preventDefault();
  }
};

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const { addresses, createAddressAsync, updateAddressAsync, deleteAddress } = useAddresses();
  const {
    profile,
    updateProfile: updateDemographics,
    isUpdating: demographicsUpdating,
    updateNotifications,
    isUpdatingNotifications,
    deactivateAccount,
    isDeactivating,
  } = useProfile();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Notification preferences (local para feedback visual inmediato)
  const [notifState, setNotifState] = useState({
    emailNotifications: true,
    marketingEmails: false,
  });

  // Sincronizar preferencias cuando carga el perfil del servidor
  useEffect(() => {
    if (profile) {
      setNotifState({
        emailNotifications: profile.emailNotifications ?? true,
        marketingEmails: profile.marketingEmails ?? false,
      });
    }
  }, [profile]);

  // Profile form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: profileSubmitting },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  // Demographic form
  const {
    register: registerDemographic,
    handleSubmit: handleDemographicSubmit,
    reset: resetDemographic,
  } = useForm({
    defaultValues: { documentType: '', documentNumber: '', gender: '', dateOfBirth: '' },
  });

  // Sincronizar datos demográficos cuando carga el perfil
  useEffect(() => {
    if (profile) {
      resetDemographic({
        documentType: profile.documentType || '',
        documentNumber: profile.documentNumber || '',
        gender: profile.gender || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.substring(0, 10) : '',
      });
    }
  }, [profile, resetDemographic]);

  // Password form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPassword,
  } = useForm({
    resolver: yupResolver(changePasswordSchema),
  });

  const onProfileSubmit = async (data) => {
    const success = await updateProfile(data);
    if (success) toast.success('Perfil actualizado');
  };

  const onPasswordSubmit = async () => {
    // Mock
    await new Promise((r) => setTimeout(r, 500));
    toast.success('Contraseña actualizada');
    resetPassword();
  };

  const handleAddressSubmit = async (data) => {
    try {
      if (editingAddress) {
        await updateAddressAsync({ id: editingAddress._id || editingAddress.id, data });
        toast.success('Dirección actualizada');
      } else {
        await createAddressAsync(data);
        toast.success('Dirección agregada');
      }
      setShowAddressModal(false);
      setEditingAddress(null);
    } catch {
      toast.error('Error al guardar la dirección');
    }
  };

  const handleDeleteAddress = (addressId) => {
    deleteAddress(addressId);
    toast.success('Dirección eliminada');
  };

  const onDemographicSubmit = (data) => {
    updateDemographics(data);
  };

  const handleToggleNotification = (key) => {
    const newState = { ...notifState, [key]: !notifState[key] };
    setNotifState(newState);
    updateNotifications(newState);
  };

  const handleDeactivateAccount = async () => {
    try {
      await deactivateAccount();
      toast.success('Cuenta desactivada');
      logout();
    } catch {
      toast.error('Error al desactivar la cuenta');
    }
  };

  const tabs = [
    { id: 'info', label: 'Info Personal', icon: <IoPersonCircle size={18} /> },
    { id: 'addresses', label: 'Direcciones', icon: <IoLocation size={18} /> },
    { id: 'password', label: 'Contraseña', icon: <IoLockClosed size={18} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mi Perfil</h1>

      {/* Accesos rápidos — patrón idéntico a mobile profile.tsx */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          to="/perfil/pedidos"
          className="flex items-center gap-3 bg-ui-surface rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#10B98120' }}
          >
            <IoReceiptOutline size={20} style={{ color: '#10B981' }} />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">Mis Pedidos</p>
            <p className="text-xs text-text-secondary">Historial de compras</p>
          </div>
        </Link>

        <Link
          to="/perfil/favoritos"
          className="flex items-center gap-3 bg-ui-surface rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: '#EF444420' }}
          >
            <IoHeartOutline size={20} style={{ color: '#EF4444' }} />
          </div>
          <div>
            <p className="font-semibold text-sm text-text-primary">Favoritos</p>
            <p className="text-xs text-text-secondary">Lista de deseos</p>
          </div>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 justify-center ${
              activeTab === tab.id
                ? 'bg-white text-brand-primary shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Info Personal */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Información Personal</h2>
          <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4 max-w-md">
            <Input
              label="Nombre"
              error={profileErrors.name?.message}
              required
              onKeyDown={noNumbers}
              {...registerProfile('name')}
            />
            <Input
              label="Email"
              type="email"
              error={profileErrors.email?.message}
              required
              {...registerProfile('email')}
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="3001234567"
              maxLength={10}
              onKeyDown={onlyNumbers}
              error={profileErrors.phone?.message}
              {...registerProfile('phone')}
            />
            <Button type="submit" variant="primary" loading={profileSubmitting}>
              Guardar cambios
            </Button>
          </form>

          {/* Datos personales adicionales */}
          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold mb-4">Datos personales adicionales</h3>
            <form onSubmit={handleDemographicSubmit(onDemographicSubmit)} className="space-y-4 max-w-md">
              <div>
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Tipo de documento</span>
                </label>
                <select className="select select-bordered w-full" {...registerDemographic('documentType')}>
                  <option value="">Seleccionar...</option>
                  <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                  <option value="cedula_extranjeria">Cédula de extranjería</option>
                  <option value="pasaporte">Pasaporte</option>
                </select>
              </div>
              <Input
                label="Número de documento"
                placeholder="Ej: 1234567890"
                onKeyDown={onlyNumbers}
                {...registerDemographic('documentNumber')}
              />
              <div>
                <label className="label pb-1">
                  <span className="label-text text-sm font-medium">Género</span>
                </label>
                <select className="select select-bordered w-full" {...registerDemographic('gender')}>
                  <option value="">Seleccionar...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <Input
                label="Fecha de nacimiento"
                type="date"
                {...registerDemographic('dateOfBirth')}
              />
              <Button type="submit" variant="primary" size="sm" loading={demographicsUpdating}>
                Guardar datos adicionales
              </Button>
            </form>
          </div>

          {/* Preferencias de notificaciones */}
          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold mb-4">Notificaciones</h3>
            <div className="space-y-4 max-w-md">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Notificaciones por email</p>
                  <p className="text-xs text-gray-500">Confirmaciones y actualizaciones de pedidos</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={notifState.emailNotifications}
                  onChange={() => handleToggleNotification('emailNotifications')}
                  disabled={isUpdatingNotifications}
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-sm">Emails de marketing</p>
                  <p className="text-xs text-gray-500">Ofertas, novedades y promociones especiales</p>
                </div>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={notifState.marketingEmails}
                  onChange={() => handleToggleNotification('marketingEmails')}
                  disabled={isUpdatingNotifications}
                />
              </label>
            </div>
          </div>

          {/* Zona de peligro */}
          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Zona de peligro</h3>
            <p className="text-sm text-gray-500 mb-3">
              Desactivar tu cuenta suspenderá el acceso. Puedes contactar al soporte para reactivarla.
            </p>
            <Button
              variant="error"
              outline
              icon={<IoTrash size={16} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Desactivar cuenta
            </Button>
          </div>
        </div>
      )}

      {/* Direcciones */}
      {activeTab === 'addresses' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Mis Direcciones</h2>
            <Button
              variant="primary"
              size="sm"
              icon={<IoAdd size={18} />}
              onClick={() => {
                setEditingAddress(null);
                setShowAddressModal(true);
              }}
            >
              Agregar
            </Button>
          </div>

          {addresses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tienes direcciones guardadas.</p>
          ) : (
            <div className="space-y-3">
              {addresses.map((addr) => (
                <AddressCard
                  key={addr.id}
                  address={addr}
                  onEdit={(a) => {
                    setEditingAddress(a);
                    setShowAddressModal(true);
                  }}
                  onDelete={handleDeleteAddress}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Cambiar Contraseña</h2>
          <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
            <Input
              label="Contraseña actual"
              type="password"
              error={passwordErrors.currentPassword?.message}
              required
              {...registerPassword('currentPassword')}
            />
            <Input
              label="Nueva contraseña"
              type="password"
              error={passwordErrors.newPassword?.message}
              required
              {...registerPassword('newPassword')}
            />
            <Input
              label="Confirmar nueva contraseña"
              type="password"
              error={passwordErrors.confirmNewPassword?.message}
              required
              {...registerPassword('confirmNewPassword')}
            />
            <Button type="submit" variant="primary" loading={passwordSubmitting}>
              Cambiar contraseña
            </Button>
          </form>
        </div>
      )}

      {/* Modal Dirección */}
      <Modal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        title={editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
      >
        <AddressForm
          address={editingAddress}
          onSubmit={handleAddressSubmit}
          onCancel={() => {
            setShowAddressModal(false);
            setEditingAddress(null);
          }}
        />
      </Modal>

      {/* Modal Desactivar Cuenta */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Desactivar cuenta"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          ¿Estás seguro de que deseas desactivar tu cuenta? El acceso quedará suspendido y deberás contactar al soporte para reactivarla.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="error" onClick={handleDeactivateAccount} loading={isDeactivating}>
            Sí, desactivar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
