import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, BadgeCheck, ChevronRight, Heart, LogOut, Mail, MapPin, MessageSquare, Package, Phone, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useWishlist } from '../hooks/useWishlist';
import * as orderService from '../services/orderService';
import { formatPrice } from '../utils/format';
import OrderStatusBadge from '../components/OrderStatusBadge';

function memberSince(value) {
  const d = new Date(String(value || '').replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export default function Account() {
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const navigate = useNavigate();
  const [orders, setOrders] = useState(null);
  const [expandedDetail, setExpandedDetail] = useState(null);

  useEffect(() => {
    orderService.listOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const since = memberSince(user?.created_at);
  const latest = orders?.[0];
  const toggleDetail = (label) => {
    setExpandedDetail((current) => (current === label ? null : label));
  };
  const shortcuts = [
    { to: '/orders', icon: Package, title: 'Orders', text: orders ? `${orders.length} placed` : 'Track and manage orders' },
    { to: '/wishlist', icon: Heart, title: 'Wishlist', text: `${wishlistItems.length} saved ${wishlistItems.length === 1 ? 'item' : 'items'}` },
    { to: '/account/addresses', icon: MapPin, title: 'Addresses', text: 'Where we deliver' },
    { to: '/messages', icon: MessageSquare, title: 'Messages', text: 'Chat with the shop' },
    { to: '/notifications', icon: Bell, title: 'Notifications', text: 'Order and shop updates' },
  ];

  const details = [
    { icon: User, label: 'Name', value: user?.name },
    { icon: Mail, label: 'Email', value: user?.email },
    { icon: Phone, label: 'Phone', value: user?.phone || 'Not added' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-3 py-5 sm:px-6 sm:py-10">
      {/* Profile header */}
      <section className="relative overflow-hidden rounded-2xl bg-stone-900 p-4 text-white sm:rounded-3xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary-500/20 sm:h-56 sm:w-56" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center gap-3 sm:gap-5">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-500 font-display text-2xl font-bold sm:h-20 sm:w-20 sm:text-4xl">
            {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate font-display text-xl font-bold tracking-tight sm:text-3xl">{user?.name}</h1>
            <p className="mt-0.5 truncate text-xs text-stone-300 sm:text-sm">{user?.email}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-[10px] sm:mt-3 sm:text-xs">
              {user?.is_verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500/15 px-2 py-1 font-medium text-green-300">
                  <BadgeCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" /> Email verified
                </span>
              ) : null}
              {since && <span className="rounded-full bg-white/10 px-2 py-1 text-stone-200">Member since {since}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-full border border-white/25 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 sm:px-4 sm:py-2 sm:text-sm"
          >
            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      </section>

      <div className="mt-5 grid gap-4 sm:mt-6 sm:gap-6 lg:grid-cols-3">
        {/* Details + latest order */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-1">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="font-display text-base font-bold text-gray-900 sm:text-lg">Your details</h2>
            <dl className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
              {details.map(({ icon: Icon, label, value }) => {
                const text = String(value ?? '');
                const isExpanded = expandedDetail === label;
                const isLong = text.length > 24;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => toggleDetail(label)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <dt className="text-[10px] text-gray-500 sm:text-xs">{label}</dt>
                      <dd
                        className={[
                          'mt-0.5 block text-sm font-medium text-gray-900',
                          isLong && !isExpanded ? 'max-w-[220px] truncate' : 'break-words',
                        ].join(' ')}
                        title={isLong ? text : undefined}
                      >
                        {text}
                      </dd>
                    </div>
                  </button>
                );
              })}
            </dl>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="font-display text-base font-bold text-gray-900 sm:text-lg">Latest order</h2>
            {orders === null ? (
              <div className="mt-3 h-16 animate-pulse rounded-xl bg-gray-100 sm:mt-4" />
            ) : latest ? (
              <Link to={`/orders/${latest.id}`} className="mt-3 block rounded-xl border border-gray-100 p-3 transition hover:border-primary-200 hover:bg-primary-50/40 sm:mt-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-medium text-gray-900">{latest.orderNumber}</p>
                  <OrderStatusBadge status={latest.status} />
                </div>
                <p className="mt-1 text-sm text-gray-500">{formatPrice(latest.total)}</p>
              </Link>
            ) : (
              <p className="mt-3 text-sm text-gray-500 sm:mt-4">
                No orders yet.{' '}
                <Link to="/products" className="font-medium text-primary-600 hover:text-primary-700">Start shopping</Link>
              </p>
            )}
          </section>
        </div>

        {/* Shortcuts */}
        <section className="lg:col-span-2">
          <h2 className="sr-only">Shortcuts</h2>
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {shortcuts.map(({ to, icon: Icon, title, text }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:border-primary-300 hover:shadow-md sm:gap-4 sm:p-5"
              >
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white sm:h-12 sm:w-12">
                  <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-gray-900 sm:text-base">{title}</span>
                  <span className="block truncate text-xs text-gray-500 sm:text-sm">{text}</span>
                </span>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300 transition group-hover:translate-x-0.5 group-hover:text-primary-600" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
