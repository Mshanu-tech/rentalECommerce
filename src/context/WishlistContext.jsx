import { createContext, useCallback, useEffect, useState } from 'react';
import * as wishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated, inAdmin, user } = useAuth();
  const userId = user?.id;
  const [items, setItems] = useState([]);

  const refresh = useCallback(async () => {
    if (inAdmin) return; // the wishlist belongs to the shopper session, not the admin one
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setItems(await wishlistService.getWishlist());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, inAdmin, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isWishlisted = useCallback(
    (productId) => items.some((item) => item.productId === productId),
    [items]
  );

  const toggle = useCallback(
    async (productId) => {
      if (isWishlisted(productId)) {
        setItems(await wishlistService.removeItem(productId));
      } else {
        setItems(await wishlistService.addItem(productId));
      }
    },
    [isWishlisted]
  );

  const value = { items, refresh, isWishlisted, toggle };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
