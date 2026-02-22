import * as yup from 'yup';

// Regex reutilizables
const SOLO_LETRAS = /^[a-zA-ZÀ-ÿ\s]+$/;
const TELEFONO_CO = /^3\d{9}$/;

// ============ SCHEMAS DE AUTENTICACIÓN ============

export const loginSchema = yup.object({
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Ingresa un email válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria'),
});

export const registerSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .matches(SOLO_LETRAS, 'El nombre solo puede contener letras'),
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Ingresa un email válido'),
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/\d/, 'Debe contener al menos un número'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
  terms: yup
    .boolean()
    .oneOf([true], 'Debes aceptar los términos y condiciones'),
});

export const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Ingresa un email válido'),
});

export const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .required('La contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/\d/, 'Debe contener al menos un número'),
  confirmPassword: yup
    .string()
    .required('Confirma tu contraseña')
    .oneOf([yup.ref('password')], 'Las contraseñas no coinciden'),
});

// ============ SCHEMAS DE PERFIL ============

export const profileSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .matches(SOLO_LETRAS, 'El nombre solo puede contener letras'),
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Ingresa un email válido'),
  phone: yup
    .string()
    .matches(TELEFONO_CO, 'Ingresa un teléfono colombiano válido (10 dígitos, empieza por 3)')
    .nullable()
    .transform((value) => value || null),
});

export const addressSchema = yup.object({
  label: yup
    .string()
    .required('Selecciona un tipo de dirección'),
  fullName: yup
    .string()
    .required('El nombre completo es obligatorio')
    .matches(SOLO_LETRAS, 'El nombre solo puede contener letras'),
  streetAddress: yup
    .string()
    .required('La dirección es obligatoria'),
  city: yup
    .string()
    .required('La ciudad es obligatoria')
    .matches(SOLO_LETRAS, 'La ciudad solo puede contener letras'),
  phoneNumber: yup
    .string()
    .required('El teléfono es obligatorio')
    .matches(TELEFONO_CO, 'Teléfono colombiano válido (10 dígitos, empieza por 3)'),
  isDefault: yup.boolean(),
});

export const changePasswordSchema = yup.object({
  currentPassword: yup
    .string()
    .required('La contraseña actual es obligatoria'),
  newPassword: yup
    .string()
    .required('La nueva contraseña es obligatoria')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .matches(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .matches(/[a-z]/, 'Debe contener al menos una minúscula')
    .matches(/\d/, 'Debe contener al menos un número'),
  confirmNewPassword: yup
    .string()
    .required('Confirma la nueva contraseña')
    .oneOf([yup.ref('newPassword')], 'Las contraseñas no coinciden'),
});

// ============ SCHEMAS DE CONTACTO ============

export const contactSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio')
    .matches(SOLO_LETRAS, 'El nombre solo puede contener letras'),
  email: yup
    .string()
    .required('El email es obligatorio')
    .email('Ingresa un email válido'),
  message: yup
    .string()
    .required('El mensaje es obligatorio')
    .min(10, 'El mensaje debe tener al menos 10 caracteres'),
});

// ============ SCHEMAS DE ADMIN ============

export const productSchema = yup.object({
  name: yup
    .string()
    .required('El nombre es obligatorio'),
  description: yup
    .string()
    .required('La descripción es obligatoria'),
  price: yup
    .number()
    .required('El precio es obligatorio')
    .positive('El precio debe ser mayor a 0')
    .typeError('Ingresa un precio válido'),
  category: yup
    .string()
    .required('La categoría es obligatoria'),
  stock: yup
    .number()
    .min(0, 'El stock no puede ser negativo')
    .typeError('Ingresa un número válido'),
  discount: yup
    .number()
    .min(0, 'El descuento no puede ser negativo')
    .max(100, 'El descuento no puede ser mayor a 100%')
    .nullable()
    .transform((value) => (isNaN(value) ? null : value)),
});

export const promotionSchema = yup.object({
  code: yup
    .string()
    .required('El código es obligatorio')
    .uppercase(),
  description: yup
    .string()
    .required('La descripción es obligatoria'),
  discountPercent: yup
    .number()
    .required('El porcentaje es obligatorio')
    .min(1, 'El descuento mínimo es 1%')
    .max(100, 'El descuento máximo es 100%')
    .typeError('Ingresa un porcentaje válido'),
  active: yup.boolean(),
  validUntil: yup
    .string()
    .required('La fecha de expiración es obligatoria'),
});
