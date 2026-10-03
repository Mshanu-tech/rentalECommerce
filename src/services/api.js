import axios from 'axios';

// Set VITE_API_URL when the API is not running on the local development port.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://apiretalwebsite123.herositepro.com/api';

// Uploaded images are served from the API's origin, not under /api itself
// (see server.js's `/uploads` static mount) — strip the /api suffix so
// product/category image URLs (e.g. "/uploads/products/x.jpg") resolve.
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Turns a relative upload path (e.g. "/uploads/products/x.jpg") into an absolute URL. */
export function getImageUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Customers and admins keep separate sessions in separate storage keys, so being signed in as
 * an admin never leaks into the shop (and vice versa). Anything under /admin uses the admin
 * token; everything else uses the customer token.
 */
export const CUSTOMER_TOKEN_KEY = 'token';
export const ADMIN_TOKEN_KEY = 'adminToken';

export function isAdminArea() {
  return window.location.pathname.startsWith('/admin');
}

export function currentTokenKey() {
  return isAdminArea() ? ADMIN_TOKEN_KEY : CUSTOMER_TOKEN_KEY;
}

// Attach the JWT for the current area (if present) to every outgoing request.
api.interceptors.request.use((config) => {
  if (config.headers.Authorization) return config; // explicitly set by the caller
  const token = localStorage.getItem(currentTokenKey());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error responses so components can rely on a consistent shape.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, message });
  }
);

export default api;
