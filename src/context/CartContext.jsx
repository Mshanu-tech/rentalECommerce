import { createContext, useCallback, useEffect, useState } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext(null);

const EMPTY_CART = { items: [], itemCount: 0, subtotal: 0, hasIssues: false };

export function CartProvider({ children }) {
  const { isAuthenticated, inAdmin, user } = useAuth();
  const userId = user?.id;
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (inAdmin) return; // the cart belongs to the shopper session, not the admin one
    if (!isAuthenticated) {
      setCart(EMPTY_CART);
      return;
    }
    setLoading(true);
    try {
      setCart(await cartService.getCart());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, inAdmin, userId]);

  // Reload whenever login state changes — logging out clears it, logging in fetches it.
  useEffect(() => {
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    setCart(await cartService.addItem(productId, quantity));
  }, []);

  const updateItemQuantity = useCallback(async (productId, quantity) => {
    setCart(await cartService.updateItemQuantity(productId, quantity));
  }, []);

  const removeItem = useCallback(async (productId) => {
    setCart(await cartService.removeItem(productId));
  }, []);

  const clearCart = useCallback(async () => {
    setCart(await cartService.clearCart());
  }, []);

  const value = { cart, loading, refresh, addItem, updateItemQuantity, removeItem, clearCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
