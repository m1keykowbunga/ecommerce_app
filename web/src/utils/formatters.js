import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

/**
 * Formatear cantidad como moneda colombiana (COP)
 * @param {number} amount - Cantidad a formatear
 * @returns {string} Cantidad formateada
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '$0';
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Formatear fecha en español
 * @param {string|Date} date - Fecha a formatear
 * @param {string} format - Formato (por defecto: 'DD/MM/YYYY')
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, format = 'DD/MM/YYYY') => {
  if (!date) return '';
  return moment(date).format(format);
};

/**
 * Formatear fecha de forma relativa (hace 2 días, hace 1 mes, etc)
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha relativa
 */
export const formatRelativeDate = (date) => {
  if (!date) return '';
  return moment(date).fromNow();
};

/**
 * Formatear fecha y hora completa
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} Fecha y hora formateada
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return moment(date).format('DD/MM/YYYY HH:mm');
};

/**
 * Formatear número de teléfono colombiano
 * @param {string} phone - Número de teléfono
 * @returns {string} Teléfono formateado
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Eliminar espacios y caracteres especiales
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 10) {
    // Formato: (300) 123-4567
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  
  return phone;
};

/**
 * Formatear número de documento (cédula)
 * @param {string} document - Número de documento
 * @returns {string} Documento formateado
 */
export const formatDocument = (document) => {
  if (!document) return '';
  
  // Eliminar puntos y espacios
  const cleaned = document.replace(/\D/g, '');
  
  // Agregar puntos cada 3 dígitos
  return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Truncar texto con ellipsis
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Capitalizar primera letra
 * @param {string} text - Texto
 * @returns {string} Texto capitalizado
 */
export const capitalize = (text) => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Calcular porcentaje de descuento
 * @param {number} originalPrice - Precio original
 * @param {number} currentPrice - Precio actual
 * @returns {number} Porcentaje de descuento
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) return 0;
  
  const discount = ((originalPrice - currentPrice) / originalPrice) * 100;
  return Math.round(discount);
};

/**
 * Formatear número con separadores de miles
 * @param {number} num - Número
 * @returns {string} Número formateado
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('es-CO').format(num);
};

/**
 * Generar slug desde texto
 * @param {string} text - Texto
 * @returns {string} Slug
 */
export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .trim()
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-'); // Eliminar guiones múltiples
};

/**
 * Validar email
 * @param {string} email - Email
 * @returns {boolean} Es válido
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Validar teléfono colombiano
 * @param {string} phone - Teléfono
 * @returns {boolean} Es válido
 */
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 && cleaned.startsWith('3');
};

/**
 * Generar color aleatorio
 * @returns {string} Color en formato hex
 */
export const generateRandomColor = () => {
  const colors = [
    '#F59E0B', '#EF4444', '#10B981', '#3B82F6', 
    '#8B5CF6', '#EC4899', '#F97316', '#14B8A6'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Obtener iniciales de nombre
 * @param {string} name - Nombre completo
 * @returns {string} Iniciales
 */
export const getInitials = (name) => {
  if (!name) return '';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};
