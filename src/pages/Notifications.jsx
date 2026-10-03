import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as notificationService from '../services/notificationService';
import { timeAgo } from '../utils/format';

export default function Notifications({ title = 'Notifications' }) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    notificationService
      .listNotifications({ unread: unreadOnly, page, limit: 20 })
      .then((data) => {
        if (cancelled) return;
        setNotifications(data.notifications);
        setPagination(data.pagination);
        setUnreadCount(data.unreadCount);
        setError('');
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [unreadOnly, page]);

  async function open(n) {
    if (!n.isRead) {
      setNotifications((prev) => prev.map((i) => (i.id === n.id ? { ...i, isRead: true } : i)));
      setUnreadCount((c) => Math.max(0, c - 1));
      notificationService.markRead(n.id).catch(() => {});
    }
    if (n.link) navigate(n.link);
  }

  async function markAll() {
    await notificationService.markAllRead().catch(() => {});
    setNotifications((prev) => prev.map((i) => ({ ...i, isRead: true })));
    setUnreadCount(0);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAll} className="text-sm font-medium text-primary-600 hover:underline">
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      <label className="mt-4 inline-flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={unreadOnly}
          onChange={(e) => {
            setPage(1);
            setUnreadOnly(e.target.checked);
          }}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        Unread only
      </label>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <div className="mt-6 h-40 animate-pulse rounded-2xl bg-gray-100" />
      ) : notifications.length === 0 ? (
        <p className="mt-8 text-sm text-gray-500">{unreadOnly ? 'No unread notifications.' : 'No notifications yet.'}</p>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white">
            {notifications.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-gray-50 ${n.isRead ? '' : 'bg-primary-50/40'}`}
                >
                  <span
                    className={`mt-2 h-2 w-2 flex-shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-primary-600'}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-gray-900">{n.title}</span>
                    <span className="block text-sm text-gray-600">{n.message}</span>
                  </span>
                  <span className="flex-shrink-0 text-xs text-gray-400">{timeAgo(n.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>

          {pagination.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
              <p>
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
