import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

const MAX = 1000;

function dayLabel(value) {
  const d = new Date(String(value).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date(Date.now() - 86_400_000);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function clock(value) {
  const d = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

/**
 * Message bubbles grouped by day. `mineRole` is which side "you" are ('admin' or 'customer'),
 * so your messages sit on the right. Sticks to the bottom as new messages arrive.
 */
export function ChatThread({ messages, mineRole, emptyText }) {
  const endRef = useRef(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [lastId]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-gray-500">
        <p className="max-w-xs">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5 sm:px-6">
      {messages.map((m, i) => {
        const day = dayLabel(m.createdAt);
        const showDay = i === 0 || day !== dayLabel(messages[i - 1].createdAt);
        const mine = m.senderRole === mineRole;
        return (
          <div key={m.id}>
            {showDay && (
              <p className="my-3 text-center text-xs font-medium text-gray-400">{day}</p>
            )}
            <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] ${
                  mine ? 'rounded-br-md bg-primary-600 text-white' : 'rounded-bl-md bg-white text-gray-900 shadow-sm ring-1 ring-gray-200'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? 'text-white/70' : 'text-gray-400'}`}>
                  {clock(m.createdAt)}
                  {mine && mineRole === 'admin' && (m.isRead ? ' · Seen' : '')}
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}

/** Textarea + send button. Enter sends, Shift+Enter adds a line. */
export function ChatComposer({ onSend, placeholder = 'Write a message…', disabled }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setError('');
    try {
      await onSend(body);
      setText('');
    } catch (err) {
      setError(err.message || 'Could not send the message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t border-gray-200 bg-white p-3 sm:p-4">
      {error && <p role="alert" className="mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Message"
          className="max-h-32 min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={send}
          disabled={disabled || sending || !text.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {text.length > MAX - 100 && <p className="mt-1 text-right text-xs text-gray-400">{text.length}/{MAX}</p>}
    </div>
  );
}
