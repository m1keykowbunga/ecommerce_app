/**
 * Constantes de la aplicación
 */

// Configuración de paginación
export const ITEMS_PER_PAGE = parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 12;

// Estados de pedidos — valores en inglés (backend) con aliases en español (legacy)
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REJECTED: 'rejected',
  IN_PREPARATION: 'in_preparation',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELED: 'canceled',
};

// Colores de estados — hex exactos igual que mobile (getOrderStatus en lib/utils.ts)
// Incluye aliases en español para compatibilidad con datos legacy
export const ORDER_STATUS_COLORS = {
  // Inglés (backend actual)
  pending: '#F59E0B',
  paid: '#3B82F6',
  rejected: '#EF4444',
  in_preparation: '#B06A4A',
  ready: '#10B981',
  delivered: '#10B981',
  canceled: '#EF4444',
  // Español (legacy / compatibilidad)
  pendiente: '#F59E0B',
  pagado: '#3B82F6',
  rechazado: '#EF4444',
  en_preparacion: '#B06A4A',
  listo: '#10B981',
  entregado: '#10B981',
  cancelado: '#EF4444',
};

// Textos de estados — igual que mobile
export const ORDER_STATUS_LABELS = {
  // Inglés (backend actual)
  pending: 'Pendiente',
  paid: 'Pagado',
  rejected: 'Rechazado',
  in_preparation: 'En Preparación',
  ready: 'Listo',
  delivered: 'Entregado',
  canceled: 'Cancelado',
  // Español (legacy / compatibilidad)
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  rechazado: 'Rechazado',
  en_preparacion: 'En Preparación',
  listo: 'Listo',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

// Opciones de ordenamiento de productos
export const SORT_OPTIONS = [
  { value: '', label: 'Más Relevantes' },
  { value: 'name_asc', label: 'Nombre (A-Z)' },
  { value: 'name_desc', label: 'Nombre (Z-A)' },
  { value: 'price_asc', label: 'Precio (Menor a Mayor)' },
  { value: 'price_desc', label: 'Precio (Mayor a Menor)' },
  { value: 'newest', label: 'Más Recientes' },
  { value: 'popular', label: 'Más Populares' },
];

// Rangos de precio para filtros
export const PRICE_RANGES = [
  { min: 0, max: 5000, label: 'Menos de $5.000' },
  { min: 5000, max: 10000, label: '$5.000 - $10.000' },
  { min: 10000, max: 20000, label: '$10.000 - $20.000' },
  { min: 20000, max: 50000, label: '$20.000 - $50.000' },
  { min: 50000, max: null, label: 'Más de $50.000' },
];

// Métodos de pago
export const PAYMENT_METHODS = {
  TRANSFER: 'transferencia',
};

// Datos bancarios (estos deberían venir del backend)
export const BANK_INFO = {
  banco: 'Bancolombia',
  titular: 'Don Palito Junior',
  numero: '123-456789-01',
  tipo: 'Ahorros',
};

// Información de contacto
export const CONTACT_INFO = {
  phone: import.meta.env.VITE_WHATSAPP_NUMBER || '573148702078',
  email: 'luchodonpalito@gmail.com',
  address: 'Cra 47 #76D Sur - 37, Sabaneta, Antioquia',
  coordinates: {
    lat: 6.151316,
    lng: -75.616389,
  },
  schedule: {
    weekdays: '8:00 AM - 8:00 PM',
    saturday: '9:00 AM - 7:00 PM',
    sunday: '10:00 AM - 4:00 PM',
  },
};

// Redes sociales
export const SOCIAL_MEDIA = {
  facebook: 'https://facebook.com/donpalitojr',
  instagram: 'https://instagram.com/donpalitojr',
  twitter: 'https://twitter.com/donpalitojr',
};

// Calificaciones (estrellas)
export const RATING_OPTIONS = [1, 2, 3, 4, 5];

// Mensajes de validación
export const VALIDATION_MESSAGES = {
  required: 'Este campo es obligatorio',
  email: 'Ingresa un email válido',
  minLength: (min) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max) => `No debe superar ${max} caracteres`,
  phone: 'Ingresa un número de teléfono válido',
  passwordMatch: 'Las contraseñas no coinciden',
  minValue: (min) => `El valor mínimo es ${min}`,
  maxValue: (max) => `El valor máximo es ${max}`,
};

// Expresiones regulares
export const REGEX = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^3\d{9}$/,
  document: /^\d{6,10}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/,
};

// Límites
export const LIMITS = {
  maxCartItems: 50,
  maxQuantityPerItem: 99,
  maxReviewLength: 500,
  maxCommentLength: 1000,
};

// Timeouts
export const TIMEOUTS = {
  debounceSearch: 500,
  toastDuration: 3000,
  sessionWarning: 300000, // 5 minutos antes de expirar
};

// Local Storage Keys
export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  cart: 'cart',
  recentSearches: 'recentSearches',
  cookiesAccepted: 'cookiesAccepted',
};

// Rutas de la aplicación
export const ROUTES = {
  home: '/',
  products: '/productos',
  productDetail: '/productos/:id',
  cart: '/carrito',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/exito',
  login: '/login',
  register: '/registro',
  forgotPassword: '/recuperar-password',
  resetPassword: '/restablecer-password/:token',
  profile: '/perfil',
  orders: '/perfil/pedidos',
  orderDetail: '/perfil/pedidos/:id',
  contact: '/contacto',
  about: '/sobre-nosotros',
  faq: '/preguntas-frecuentes',
  terms: '/terminos-condiciones',
  privacy: '/politica-privacidad',
  cookies: '/politica-cookies',
};

// Mensajes de toast
export const TOAST_MESSAGES = {
  success: {
    addToCart: 'Producto agregado al carrito',
    updateCart: 'Carrito actualizado',
    removeFromCart: 'Producto eliminado del carrito',
    orderCreated: 'Pedido creado exitosamente',
    profileUpdated: 'Perfil actualizado',
    passwordChanged: 'Contraseña actualizada',
    reviewCreated: 'Reseña publicada',
    reviewUpdated: 'Reseña actualizada',
    reviewDeleted: 'Reseña eliminada',
  },
  error: {
    generic: 'Ocurrió un error. Por favor intenta nuevamente.',
    network: 'Error de conexión. Verifica tu internet.',
    invalidCredentials: 'Email o contraseña incorrectos',
    sessionExpired: 'Sesión expirada. Por favor inicia sesión nuevamente.',
    outOfStock: 'Producto sin stock disponible',
    invalidCoupon: 'Cupón inválido o expirado',
  },
};

// Tamaños de imagen
export const IMAGE_SIZES = {
  thumbnail: { width: 100, height: 100 },
  card: { width: 300, height: 300 },
  detail: { width: 800, height: 800 },
};

// IVA Colombia
export const IVA_RATE = 0.19; // 19%

// Categorías reales de productos (alineadas con mobile y MongoDB)
// El Catalog.jsx las deriva dinámicamente de los productos, pero se documentan aquí
// como referencia del enum exacto que usa el backend.
export const PRODUCT_CATEGORIES = [
  'Palitos Premium',
  'Cocteleros',
  'Dulces',
  'Especiales',
  'Nuevos',
];
