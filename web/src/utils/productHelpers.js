/**
 * Normaliza el ID de un producto, compatible con MongoDB (_id) y mock (id).
 */
export const getProductId = (product) => {
  if (!product) return null;
  return product._id || product.id || null;
};

/**
 * Obtiene la imagen principal de un producto.
 */
export const getProductImage = (product) => {
  if (!product) return '';
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images[0];
  }
  return product.image || '';
};

/**
 * Calcula el precio final de un producto aplicando descuento si existe.
 */
export const getFinalPrice = (product) => {
  if (!product) return 0;
  if (product.discount && product.discount > 0) {
    return Math.round(product.price * (1 - product.discount / 100));
  }
  return product.price || 0;
};
