import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'react-toastify';
import { IoPersonCircle, IoLocation, IoLockClosed, IoTrash, IoAdd } from 'react-icons/io5';
import { useAuth } from '../../contexts/AuthContext';
import { profileSchema, changePasswordSchema } from '../../utils/validationSchemas';
import { addressServiceMock } from '../../services/addressService';
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
  const [addresses, setAddresses] = useState(
    addressServiceMock.getUserAddresses(user?.id || 'u1')
  );
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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

  const handleAddressSubmit = (data) => {
    if (editingAddress) {
      addressServiceMock.updateAddress(editingAddress.id, data);
      toast.success('Dirección actualizada');
    } else {
      addressServiceMock.createAddress(user?.id || 'u1', data);
      toast.success('Dirección agregada');
    }
    setAddresses(addressServiceMock.getUserAddresses(user?.id || 'u1'));
    setShowAddressModal(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = (addressId) => {
    addressServiceMock.deleteAddress(addressId);
    setAddresses(addressServiceMock.getUserAddresses(user?.id || 'u1'));
    toast.success('Dirección eliminada');
  };

  const handleDeleteAccount = () => {
    toast.info('Cuenta eliminada (mock)');
    logout();
  };

  const tabs = [
    { id: 'info', label: 'Info Personal', icon: <IoPersonCircle size={18} /> },
    { id: 'addresses', label: 'Direcciones', icon: <IoLocation size={18} /> },
    { id: 'password', label: 'Contraseña', icon: <IoLockClosed size={18} /> },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-brand-secondary mb-6">Mi Perfil</h1>

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

          <div className="border-t mt-8 pt-6">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Zona de peligro</h3>
            <p className="text-sm text-gray-500 mb-3">
              Una vez elimines tu cuenta, no hay vuelta atrás.
            </p>
            <Button
              variant="error"
              outline
              icon={<IoTrash size={16} />}
              onClick={() => setShowDeleteModal(true)}
            >
              Eliminar cuenta
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

      {/* Modal Eliminar Cuenta */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Eliminar cuenta"
        size="sm"
      >
        <p className="text-gray-600 mb-4">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="error" onClick={handleDeleteAccount}>
            Sí, eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Profile;
