import { NavLink } from 'react-router-dom';
import { Home, Heart, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

/**
 * Customer app-style tab bar, pinned to the bottom of the screen on phones only (hidden from
 * the `md` breakpoint up, where the header nav takes over).
 */
export default function MobileBottomNav() {
  const { isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();

  const tabs = [
    { to: '/', label: 'Home', icon: Home, end: true },
    { to: '/products', label: 'Shop', icon: LayoutGrid },
    { to: '/wishlist', label: 'Wishlist', icon: Heart, count: isAuthenticated ? wishlistItems.length : 0 },
    { to: '/cart', label: 'Cart', icon: ShoppingCart, count: cart.itemCount },
    { to: isAuthenticated ? '/account' : '/login', label: isAuthenticated ? 'Account' : 'Log in', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {tabs.map(({ to, label, icon: Icon, end, count }) => (
          <li key={label}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 px-1 pb-2 pt-2.5 text-[11px] font-medium transition ${
                  isActive ? 'text-primary-600' : 'text-gray-500 active:text-gray-700'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon className={`h-[22px] w-[22px] ${isActive ? 'stroke-[2.4]' : ''}`} aria-hidden="true" />
                    <Badge count={count} />
                  </span>
                  <span>{label}</span>
                  <span className={`mt-0.5 h-0.5 w-5 rounded-full transition ${isActive ? 'bg-primary-600' : 'bg-transparent'}`} />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
