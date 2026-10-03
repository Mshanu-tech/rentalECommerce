import { Link } from 'react-router-dom';
import { ShieldCheck, ShoppingBag } from 'lucide-react';

/** Split-screen frame shared by every sign-in style page (login, admin login, forgot password). */
export default function AuthShell({ admin = false, title, subtitle, children, footer }) {
  return (
    <div className="grid min-h-screen bg-gray-50 lg:grid-cols-2">
      <div
        className={`relative hidden flex-col justify-between overflow-hidden p-12 text-white lg:flex ${
          admin
            ? 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800'
            : 'bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800'
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/5" />
        <Link to={admin ? '/admin' : '/'} className="relative flex items-center gap-2 text-xl font-semibold">
          {admin ? <ShieldCheck className="h-6 w-6" aria-hidden="true" /> : <ShoppingBag className="h-6 w-6" aria-hidden="true" />}
          {admin ? 'ShopEase Admin' : 'ShopEase'}
        </Link>
        <div className="relative">
          <h2 className="max-w-md text-4xl font-semibold leading-tight">
            {admin ? 'Run your store with confidence.' : 'Good things are waiting in your cart.'}
          </h2>
          <p className="mt-4 max-w-md text-white/80">
            {admin
              ? 'Orders, stock, reviews and customers — everything you need in one place.'
              : 'Sign in to track orders, save favourites and check out faster.'}
          </p>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} ShopEase</p>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            {admin && (
              <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-gray-900 px-2.5 py-0.5 text-xs font-medium text-white">
                <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Admin portal
              </span>
            )}
            <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
            <div className="mt-6">{children}</div>
          </div>
          {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export const inputClass =
  'mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';
