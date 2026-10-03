import { createContext, useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import * as authService from '../services/authService';
import { ADMIN_TOKEN_KEY, CUSTOMER_TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

/**
 * Holds two independent sessions — the shopper's and the admin's — so signing in as an admin
 * never changes what the storefront shows, and vice versa. `useAuth()` returns whichever
 * session belongs to the area you're in: /admin/* gets the admin, everything else the customer.
 */
export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const inAdmin = pathname.startsWith('/admin');

  const [customer, setCustomer] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true); // true while existing tokens are being checked

  useEffect(() => {
    let cancelled = false;

    async function restore(key, setter, requiredRole) {
      const token = localStorage.getItem(key);
      if (!token) return;
      try {
        const { user } = await authService.meRequest(token);
        const roleOk = requiredRole === 'admin' ? user.role === 'admin' : user.role !== 'admin';
        if (!roleOk) throw new Error('wrong role for this session');
        if (!cancelled) setter(user);
      } catch {
        localStorage.removeItem(key);
      }
    }

    Promise.all([
      restore(CUSTOMER_TOKEN_KEY, setCustomer, 'customer'),
      restore(ADMIN_TOKEN_KEY, setAdmin, 'admin'),
    ]).finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, []);

  const register = useCallback((payload) => authService.registerRequest(payload), []);
  const resendOtp = useCallback((email) => authService.resendOtpRequest({ email }), []);

  const verifyOtp = useCallback(async ({ email, otp }) => {
    const { token, user } = await authService.verifyOtpRequest({ email, otp });
    localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
    setCustomer(user);
    return user;
  }, []);

  // Login checks the password and emails a code; verification creates the session.
  const login = useCallback(
    ({ email, password }) => authService.loginRequest({ email, password, portal: inAdmin ? 'admin' : 'customer' }),
    [inAdmin]
  );

  const verifyLoginOtp = useCallback(
    async ({ email, otp }) => {
      const { token, user } = await authService.verifyLoginOtpRequest({
        email,
        otp,
        portal: inAdmin ? 'admin' : 'customer',
      });
      localStorage.setItem(inAdmin ? ADMIN_TOKEN_KEY : CUSTOMER_TOKEN_KEY, token);
      (inAdmin ? setAdmin : setCustomer)(user);
      return user;
    },
    [inAdmin]
  );

  const resendLoginOtp = useCallback(
    (email) => authService.resendLoginOtpRequest({ email, portal: inAdmin ? 'admin' : 'customer' }),
    [inAdmin]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logoutRequest();
    } catch {
      // Token may already be invalid/expired — clear local state regardless.
    }
    localStorage.removeItem(inAdmin ? ADMIN_TOKEN_KEY : CUSTOMER_TOKEN_KEY);
    (inAdmin ? setAdmin : setCustomer)(null);
  }, [inAdmin]);

  const user = inAdmin ? admin : customer;

  const value = {
    user,
    loading,
    inAdmin,
    isAuthenticated: Boolean(user),
    register,
    verifyOtp,
    resendOtp,
    login,
    verifyLoginOtp,
    resendLoginOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
