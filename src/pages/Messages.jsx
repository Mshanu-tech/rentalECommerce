import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Store } from 'lucide-react';
import * as messageService from '../services/messageService';
import { ChatComposer, ChatThread } from '../components/Chat';

/** The customer's conversation with the shop. Opened from the notification bell or My account. */
export default function Messages() {
  const [messages, setMessages] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const data = await messageService.getMyThread();
      setMessages(data.messages);
      setError('');
    } catch (err) {
      setError(err.message || 'Could not load your messages.');
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(() => document.visibilityState === 'visible' && load(), 10_000);
    return () => clearInterval(timer);
  }, [load]);

  async function handleSend(body) {
    const msg = await messageService.sendMyMessage(body);
    setMessages((m) => [...(m || []), msg]);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link to="/account" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> My account
      </Link>

      <div className="mt-4 flex h-[calc(100vh-14rem)] min-h-[26rem] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-white">
            <Store className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-base font-semibold text-gray-900">ShopEase support</h1>
            <p className="text-xs text-gray-500">Messages from our team appear here and in your notifications.</p>
          </div>
        </header>

        {error ? (
          <p className="flex flex-1 items-center justify-center p-8 text-sm text-red-600">{error}</p>
        ) : messages === null ? (
          <p className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</p>
        ) : (
          <ChatThread messages={messages} mineRole="customer" emptyText="No messages yet. Ask us anything about an order or a product — we'll reply here." />
        )}
        <ChatComposer onSend={handleSend} placeholder="Write to ShopEase…" disabled={messages === null} />
      </div>
    </div>
  );
}
