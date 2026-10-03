import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import * as notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';
import { timeAgo } from '../utils/format';

const POLL_MS = 60_000;

/**
 * Header bell with an unread badge and a dropdown of the latest notifications. The badge is
 * kept fresh by polling a cheap unread-count endpoint every minute (paused while the tab is
 * hidden); the full list is only fetched when the dropdown is opened.
 */
export default function NotificationBell({ align = 'right', viewAllPath = '/notifications' }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [popupTop, setPopupTop] = useState(0);
  const rootRef = useRef(null);

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await notificationService.getUnreadCount());
    } catch {
      /* a failed poll just leaves the old badge in place */
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      return undefined;
    }
    refreshCount();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refreshCount();
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [isAuthenticated, refreshCount]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    function onPointer(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setPopupTop((rootRef.current?.getBoundingClientRect().bottom || 0) + 8);
    setLoading(true);
    try {
      const data = await notificationService.listNotifications({ limit: 8 });
      setItems(data.notifications);
      setUnread(data.unreadCount);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleItemClick(n) {
    setOpen(false);
    if (!n.isRead) {
      setItems((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      setUnread((c) => Math.max(0, c - 1));
      notificationService.markRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  }

  async function handleMarkAll() {
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    notificationService.markAllRead().catch(() => {});
  }

  if (!isAuthenticated) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={unread > 0 ? `Notifications (${unread} unread)` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-full p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{ '--notification-top': `${popupTop}px` }}
          className={`fixed inset-x-4 top-[var(--notification-top)] z-50 mx-auto max-h-[calc(100dvh-5rem)] w-auto max-w-sm overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-lg sm:absolute sm:inset-x-auto sm:top-auto sm:mx-0 sm:mt-2 sm:w-80 sm:max-w-[90vw] ${
            align === 'left' ? 'sm:left-0' : 'sm:right-0'
          }`}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={handleMarkAll} className="text-xs font-medium text-primary-600 hover:underline">
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-400">You're all caught up.</p>
            ) : (
              <ul className="divide-y divide-gray-50">
                {items.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleItemClick(n)}
                      className={`flex w-full gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${n.isRead ? '' : 'bg-primary-50/40'}`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 flex-shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary-600'}`}
                        aria-hidden="true"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-gray-900">{n.title}</span>
                        <span className="block text-sm text-gray-600">{n.message}</span>
                        <span className="mt-0.5 block text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link
            to={viewAllPath}
            onClick={() => setOpen(false)}
            className="block border-t border-gray-100 px-4 py-3 text-center text-sm font-medium text-primary-600 hover:bg-gray-50"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
}
