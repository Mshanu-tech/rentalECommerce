import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import * as messageService from '../services/messageService';

const POLL_MS = 30_000;

/** Navbar icon that opens the admin Messages page, with a badge of unread customer messages. */
export default function AdminMessageButton() {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      setUnread(await messageService.getAdminUnreadCount());
    } catch {
      /* keep the old badge if a poll fails */
    }
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    // The Messages page fires this after reading or sending, so the badge clears immediately.
    window.addEventListener('messages-updated', refresh);
    return () => {
      clearInterval(timer);
      window.removeEventListener('messages-updated', refresh);
    };
  }, [refresh]);

  return (
    <Link
      to="/admin/messages"
      aria-label={unread > 0 ? `Messages (${unread} unread)` : 'Messages'}
      className="relative rounded-full p-2.5 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
    >
      <MessageSquare className="h-5 w-5" aria-hidden="true" />
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-semibold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}
