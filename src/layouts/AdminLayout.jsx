import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Boxes,
  Bell,
  ClipboardList,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  ShieldCheck,
  Star,
  Tags,
  MoreHorizontal,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationBell from '../components/NotificationBell';
import AdminMessageButton from '../components/AdminMessageButton';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/stock', label: 'Stock', icon: Boxes },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
];

// The five tabs pinned to the bottom of the screen on phones; everything else lives under "More".
const tabItems = navItems.filter((i) =>
  ['/admin', '/admin/orders', '/admin/products', '/admin/stock'].includes(i.to)
);
const moreItems = navItems.filter((i) => !tabItems.includes(i));

function pageTitle(pathname) {
  const match = [...navItems].reverse().find((i) => (i.end ? pathname === i.to : pathname.startsWith(i.to)));
  return match?.label || 'Admin';
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await logout();
    navigate('/admin/login');
  }

  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-gray-900 text-gray-300">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-white">ShopEase</p>
          <p className="text-xs text-gray-500">Admin panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive ? 'bg-primary-600 text-white shadow-sm' : 'hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-gray-800 p-3">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition hover:bg-gray-800 hover:text-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" /> View shop
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition hover:bg-gray-800 hover:text-white"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>

      {/* Mobile "More" sheet (opened from the bottom bar) */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-3 shadow-xl">
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-gray-200" aria-hidden="true" />
            <div className="grid grid-cols-3 gap-3">
              {moreItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-xs font-medium transition ${
                      isActive ? 'bg-primary-50 text-primary-700' : 'bg-gray-50 text-gray-600 active:bg-gray-100'
                    }`
                  }
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  {label}
                </NavLink>
              ))}
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-gray-50 px-2 py-3 text-xs font-medium text-gray-600 active:bg-gray-100"
              >
                <ExternalLink className="h-6 w-6" aria-hidden="true" />
                View shop
              </a>
              <button
                type="button"
                onClick={handleLogout}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-red-50 px-2 py-3 text-xs font-medium text-red-600 active:bg-red-100"
              >
                <LogOut className="h-6 w-6" aria-hidden="true" />
                Log out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-gray-200 bg-white/90 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur sm:px-8 lg:pt-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white lg:hidden">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <h1 className="truncate text-base font-semibold text-gray-900">{pageTitle(pathname)}</h1>

          <div className="ml-auto flex flex-shrink-0 items-center gap-2 sm:gap-3">
            <AdminMessageButton />
            <NotificationBell align="right" viewAllPath="/admin/notifications" />
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
                {initial}
              </span>
              <div className="hidden text-left leading-tight sm:block">
                <p className="text-sm font-medium text-gray-900">{user?.name || 'Admin'}</p>
                <p className="max-w-[10rem] truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Extra bottom padding on phones so content clears the tab bar. */}
        <main className="min-w-0 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pt-8 lg:pb-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="Admin navigation"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {tabItems.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
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
                    <Icon className={`h-[22px] w-[22px] ${isActive ? 'stroke-[2.4]' : ''}`} aria-hidden="true" />
                    <span>{label}</span>
                    <span className={`mt-0.5 h-0.5 w-5 rounded-full ${isActive ? 'bg-primary-600' : 'bg-transparent'}`} />
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className={`flex w-full flex-col items-center gap-0.5 px-1 pb-2 pt-2.5 text-[11px] font-medium transition ${
                open || moreItems.some((i) => pathname.startsWith(i.to)) ? 'text-primary-600' : 'text-gray-500 active:text-gray-700'
              }`}
            >
              {open ? <X className="h-[22px] w-[22px]" aria-hidden="true" /> : <MoreHorizontal className="h-[22px] w-[22px]" aria-hidden="true" />}
              <span>More</span>
              <span className="mt-0.5 h-0.5 w-5 rounded-full bg-transparent" />
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
