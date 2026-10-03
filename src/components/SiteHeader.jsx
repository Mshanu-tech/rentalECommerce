import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Heart,
  Search,
  ShoppingBag,
  ShoppingCart,
  User,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import NotificationBell from './NotificationBell';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/products', label: 'Products' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact Us' },
];

const navClass = ({ isActive }) =>
  `transition hover:text-primary-600 ${
    isActive ? 'text-primary-600' : 'text-gray-600'
  }`;

export default function SiteHeader() {
  const { isAuthenticated, user } = useAuth();
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();

  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');

  // Keep the header search box in sync with the URL
  useEffect(() => {
    if (location.pathname === '/products') {
      setSearch(
        new URLSearchParams(location.search).get('search') || ''
      );
    } else {
      setSearch('');
    }
  }, [location.pathname, location.search]);

  function handleSearchSubmit(e) {
    e.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) {
      params.set('search', search.trim());
    }

    navigate(
      `/products${
        params.toString() ? `?${params.toString()}` : ''
      }`
    );
  }

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-3">

        {/* Logo */}
        <Link
          to="/"
          aria-label="ShopEase home"
          className="flex flex-shrink-0 items-center gap-2 text-lg font-semibold text-gray-900"
        >
          <ShoppingBag
            className="h-6 w-6 text-primary-600 sm:h-5 sm:w-5"
            aria-hidden="true"
          />

          <span className="hidden sm:inline">
            ShopEase
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-2 hidden items-center gap-6 text-sm font-medium md:flex">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={navClass}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 flex-1 items-center gap-2 md:ml-auto md:max-w-xs"
        >
          <div className="relative w-full">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              aria-label="Search products"
              className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </form>

        {/* Header Actions */}
        <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-2">

          {/* Notification
              Visible on both mobile and desktop
          */}
          <div className="block">
            <NotificationBell />
          </div>

          {/* Wishlist
              Visible on both mobile and desktop when logged in
          */}
          {isAuthenticated && (
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative hidden rounded-full p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 sm:block sm:p-2.5"
            >
              <Heart
                className="h-5 w-5"
                aria-hidden="true"
              />

              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
                  {wishlistItems.length > 9
                    ? '9+'
                    : wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Cart
              Desktop only
          */}
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative hidden rounded-full p-2 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900 sm:block sm:p-2.5"
          >
            <ShoppingCart
              className="h-5 w-5"
              aria-hidden="true"
            />

            {cart.itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-semibold text-white">
                {cart.itemCount > 9
                  ? '9+'
                  : cart.itemCount}
              </span>
            )}
          </Link>

          {/* Account
              Icon on mobile
              Icon + name on desktop
          */}
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            aria-label={
              isAuthenticated ? 'Account' : 'Log in'
            }
            className="flex items-center gap-1.5 rounded-full border border-gray-300 p-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 sm:px-4 sm:py-2"
          >
            <User
              className="h-4 w-4"
              aria-hidden="true"
            />

            <span className="hidden sm:inline">
              {isAuthenticated
                ? user?.name?.split(' ')[0] || 'Account'
                : 'Log in'}
            </span>
          </Link>

        </div>
      </div>

      {/*
        Mobile navigation menu removed.
        No hamburger / three-line button on mobile.
      */}
    </header>
  );
}