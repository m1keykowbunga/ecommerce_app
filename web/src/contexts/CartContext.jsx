import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';
import useServerCart from '../hooks/useServerCart';
import { getProductId } from '../utils/productHelpers';

const LIMITS = { maxQuantityPerItem: 99 };

const CartContext = createContext();

// ─── Carrito local (sin login) ───
const LocalCartProvider = ({ children, onItemsRef }) => {
  const [items, setItems] = useState([]);

  // Exponemos los items locales via ref para que CartProvider los pueda leer
  // justo antes de cambiar al ServerCartProvider
  useEffect(() => {
    if (onItemsRef) onItemsRef.current = items;
  }, [items, onItemsRef]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const id = getProductId(product);
      const existing = prev.find((i) => getProductId(i.product) === id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, LIMITS.maxQuantityPerItem);
        toast.success(`${product.name} actualizado en el carrito`);
        return prev.map((i) =>
          getProductId(i.product) === id ? { ...i, quantity: newQty } : i
        );
      }
      toast.success(`${product.name} agregado al carrito`);
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => getProductId(i.product) !== productId));
    toast.info('Producto eliminado del carrito');
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems((prev) =>
      prev.map((i) => getProductId(i.product) === productId ? { ...i, quantity } : i)
    );
  };

  const clearCart = () => setItems([]);

  const subtotal = items.reduce((sum, i) => {
    const price = i.product.discount
      ? Math.round(i.product.price * (1 - i.product.discount / 100))
      : i.product.price || 0;
    return sum + price * i.quantity;
  }, 0);

  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        totalItems: itemCount,
        subtotal,
        isLoading: false,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─── Carrito del servidor (con login) ───
const ServerCartProvider = ({ children, pendingItems }) => {
  const serverCart = useServerCart();
  const transferredRef = useRef(false);

  // Transferir items locales al servidor una sola vez al montar
  useEffect(() => {
    if (transferredRef.current) return;
    if (!pendingItems || pendingItems.length === 0) return;
    if (serverCart.isLoading) return; // esperar a que cargue el carrito del servidor

    transferredRef.current = true;
    pendingItems.forEach((item) => {
      const productId = getProductId(item.product);
      if (productId) {
        serverCart.addItem(item.product, item.quantity);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverCart.isLoading]);

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      serverCart.removeItem(productId);
    } else {
      serverCart.updateItem(productId, quantity);
    }
  };

  return (
    <CartContext.Provider
      value={{
        items: serverCart.items,
        addItem: serverCart.addItem,
        removeItem: serverCart.removeItem,
        updateQuantity,
        clearCart: serverCart.clearCart,
        itemCount: serverCart.itemCount,
        totalItems: serverCart.itemCount,
        subtotal: serverCart.subtotal,
        isLoading: serverCart.isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─── Provider principal (elige según auth) ───
export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  // Ref para capturar los items locales justo antes de que el usuario se autentique
  const localItemsRef = useRef([]);

  if (isAuthenticated) {
    return (
      <ServerCartProvider pendingItems={localItemsRef.current}>
        {children}
      </ServerCartProvider>
    );
  }

  return (
    <LocalCartProvider onItemsRef={localItemsRef}>
      {children}
    </LocalCartProvider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
