import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Ellipsis, ExternalLink, LayoutDashboard, LogOut, MessageSquare, Package, X } from 'lucide-react';
import { moreItems } from '../layouts/adminNav';

const tabs = [
  { to: '/admin', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare, badgeKey: 'messages' },
];

function Badge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold leading-none text-white ring-2 ring-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

function TabLabel({ active, children }) {
  return <span className={`text-[11px] leading-none ${active ? 'font-semibold' : 'font-medium'}`}>{children}</span>;
}

/**
 * Admin app-style tab bar, pinned to the bottom on phones and tablets (hidden from the `lg`
 * breakpoint up, where the sidebar takes over). Four main sections + a "More" sheet for the
 * rest, the profile, "View shop" and log out.
 */
export default function AdminBottomNav({ unreadMessages = 0, user, onLogout, sheetOpen, onSheetOpenChange }) {
  const { pathname } = useLocation();
  const [sheetShown, setSheetShown] = useState(false);
  const open = sheetOpen ?? sheetShown;
  const setOpen = onSheetOpenChange ?? setSheetShown;

  // Close the sheet whenever the page changes, and on Escape.
  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const moreActive = moreItems.some((i) => pathname.startsWith(i.to));
  const initial = (user?.name || user?.email || 'A').charAt(0).toUpperCase();
  const badges = { messages: unreadMessages };

  return (
    <>
      <nav
        aria-label="Admin navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur lg:hidden"
      >
        <ul className="mx-auto grid max-w-xl grid-cols-5">
          {tabs.map(({ to, label, icon: Icon, end, badgeKey }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex h-16 flex-col items-center justify-center gap-1 transition ${
                    isActive ? 'text-primary-600' : 'text-gray-500 active:text-gray-700'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`relative flex h-7 w-12 items-center justify-center rounded-full transition ${
                        isActive ? 'bg-primary-50' : ''
                      }`}
                    >
                      <Icon className={`h-[22px] w-[22px] ${isActive ? 'stroke-[2.4]' : ''}`} aria-hidden="true" />
                      <span className="absolute left-1/2 top-0 -ml-0.5">
                        <Badge count={badges[badgeKey]} />
                      </span>
                    </span>
                    <TabLabel active={isActive}>{label}</TabLabel>
                  </>
                )}
              </NavLink>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-haspopup="dialog"
              className={`flex h-16 w-full flex-col items-center justify-center gap-1 transition ${
                moreActive || open ? 'text-primary-600' : 'text-gray-500 active:text-gray-700'
              }`}
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-full transition ${
                  moreActive || open ? 'bg-primary-50' : ''
                }`}
              >
                <Ellipsis className="h-[22px] w-[22px]" aria-hidden="true" />
              </span>
              <TabLabel active={moreActive || open}>More</TabLabel>
            </button>
          </li>
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-gray-300" aria-hidden="true" />

            <div className="mt-3 flex items-center gap-3">
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-base font-semibold text-white">
                {initial}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5">
              {moreItems.map(({ to, label, icon: Icon }) => {
                const active = pathname.startsWith(to);
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-2 py-4 text-xs font-medium transition ${
                      active
                        ? 'border-primary-200 bg-primary-50 text-primary-700'
                        : 'border-gray-200 text-gray-700 active:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    {label}
                  </Link>
                );
              })}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 active:bg-gray-50"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" /> View shop
              </a>
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 py-3 text-sm font-medium text-red-600 active:bg-red-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
