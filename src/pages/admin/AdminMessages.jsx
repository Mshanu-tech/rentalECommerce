import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, MessageSquarePlus, Search, X } from 'lucide-react';
import * as messageService from '../../services/messageService';
import { ChatComposer, ChatThread } from '../../components/Chat';
import { timeAgo } from '../../utils/format';

const notifyHeader = () => window.dispatchEvent(new Event('messages-updated'));

function Avatar({ name, size = 'h-10 w-10' }) {
  return (
    <span className={`flex ${size} flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white`}>
      {(name || '?').charAt(0).toUpperCase()}
    </span>
  );
}

/** Search verified customers and pick one to start a brand-new conversation. */
function NewConversation({ onPick, onClose }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      messageService
        .searchCustomers(q.trim())
        .then((r) => !cancelled && setResults(r))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="absolute inset-0 z-10 flex flex-col bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 p-3">
        <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <X className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold text-gray-900">New message</p>
      </div>
      <div className="p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search customers by name or email"
            className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>
      <ul className="flex-1 overflow-y-auto">
        {loading ? (
          <li className="px-4 py-6 text-center text-sm text-gray-400">Searching…</li>
        ) : results.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-gray-500">No verified customers match “{q}”.</li>
        ) : (
          results.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onPick(c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50">
                <Avatar name={c.name} />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-gray-900">{c.name}</span>
                  <span className="block truncate text-xs text-gray-500">{c.email}</span>
                </span>
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

export default function AdminMessages() {
  const [params, setParams] = useSearchParams();
  const selectedId = Number(params.get('customer')) || null;

  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState('');
  const [listLoading, setListLoading] = useState(true);
  const [thread, setThread] = useState(null); // { customer, messages }
  const [threadError, setThreadError] = useState('');
  const [composing, setComposing] = useState(false);
  const searchRef = useRef(search);
  searchRef.current = search;

  const loadList = useCallback(async () => {
    try {
      setConversations(await messageService.listConversations(searchRef.current.trim()));
    } catch {
      /* keep the previous list */
    } finally {
      setListLoading(false);
    }
  }, []);

  // Search (debounced) + slow refresh so new customer messages show up without a reload.
  useEffect(() => {
    const t = setTimeout(loadList, search ? 250 : 0);
    return () => clearTimeout(t);
  }, [search, loadList]);
  useEffect(() => {
    const timer = setInterval(() => document.visibilityState === 'visible' && loadList(), 15_000);
    return () => clearInterval(timer);
  }, [loadList]);

  const loadThread = useCallback(async (id) => {
    try {
      const data = await messageService.getThread(id);
      setThread(data);
      setThreadError('');
      notifyHeader();
      loadList();
    } catch (err) {
      setThreadError(err.message || 'Could not load this conversation.');
    }
  }, [loadList]);

  useEffect(() => {
    setThread(null);
    setThreadError('');
    if (!selectedId) return undefined;
    loadThread(selectedId);
    const timer = setInterval(() => document.visibilityState === 'visible' && loadThread(selectedId), 8_000);
    return () => clearInterval(timer);
  }, [selectedId, loadThread]);

  function select(id) {
    setComposing(false);
    setParams(id ? { customer: String(id) } : {}, { replace: false });
  }

  async function handleSend(body) {
    const msg = await messageService.sendToCustomer(selectedId, body);
    setThread((t) => (t ? { ...t, messages: [...t.messages, msg] } : t));
    loadList();
    notifyHeader();
  }

  return (
    <div className="relative flex h-[calc(100dvh-13.5rem)] min-h-[24rem] lg:h-[calc(100vh-8.5rem)] lg:min-h-[28rem] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Conversation list */}
      <aside className={`relative w-full flex-col border-r border-gray-200 md:flex md:w-80 md:flex-shrink-0 ${selectedId ? 'hidden' : 'flex'}`}>
        <div className="flex items-center gap-2 border-b border-gray-200 p-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations"
              aria-label="Search conversations"
              className="w-full rounded-full border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <button
            type="button"
            onClick={() => setComposing(true)}
            aria-label="New message"
            title="New message"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700"
          >
            <MessageSquarePlus className="h-4 w-4" />
          </button>
        </div>

        <ul className="flex-1 divide-y divide-gray-100 overflow-y-auto">
          {listLoading ? (
            <li className="p-6 text-center text-sm text-gray-400">Loading…</li>
          ) : conversations.length === 0 ? (
            <li className="p-6 text-center text-sm text-gray-500">
              {search ? 'No conversations match your search.' : 'No conversations yet. Use the + button to message a customer.'}
            </li>
          ) : (
            conversations.map((c) => (
              <li key={c.customerId}>
                <button
                  type="button"
                  onClick={() => select(c.customerId)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-gray-50 ${c.customerId === selectedId ? 'bg-primary-50' : ''}`}
                >
                  <Avatar name={c.name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${c.unread ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>{c.name}</span>
                      <span className="flex-shrink-0 text-[11px] text-gray-400">{timeAgo(c.lastAt)}</span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span className={`truncate text-xs ${c.unread ? 'text-gray-800' : 'text-gray-500'}`}>
                        {c.lastSender === 'admin' ? 'You: ' : ''}
                        {c.lastMessage}
                      </span>
                      {c.unread > 0 && (
                        <span className="flex h-5 min-w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 px-1.5 text-[11px] font-semibold text-white">
                          {c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>

        {composing && <NewConversation onPick={select} onClose={() => setComposing(false)} />}
      </aside>

      {/* Conversation */}
      <section className={`min-w-0 flex-1 flex-col bg-gray-50 md:flex ${selectedId ? 'flex' : 'hidden'}`}>
        {!selectedId ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
              <MessageSquarePlus className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="mt-4 font-semibold text-gray-900">Message a customer</p>
            <p className="mt-1 max-w-xs text-sm text-gray-500">
              Pick a conversation, or start a new one. Customers get a notification and can reply from their account.
            </p>
          </div>
        ) : threadError ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-red-600">{threadError}</div>
        ) : !thread ? (
          <div className="flex flex-1 items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
              <button type="button" onClick={() => select(null)} aria-label="Back to conversations" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden">
                <ArrowLeft className="h-4 w-4" />
              </button>
              <Avatar name={thread.customer.name} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-900">{thread.customer.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {thread.customer.email}
                  {thread.customer.phone ? ` · ${thread.customer.phone}` : ''}
                </p>
              </div>
            </header>
            <ChatThread
              messages={thread.messages}
              mineRole="admin"
              emptyText={`Say hello to ${thread.customer.name}. They'll get a notification and can reply from their account.`}
            />
            <ChatComposer onSend={handleSend} placeholder={`Message ${thread.customer.name.split(' ')[0]}…`} />
          </>
        )}
      </section>
    </div>
  );
}
