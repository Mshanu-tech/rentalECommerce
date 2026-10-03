import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronDown, Mail, MapPin, Phone, Send } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const inputClass =
  'mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200';

const TOPICS = ['Order help', 'A product', 'Returns & cancellation', 'Something else'];
const MAX = 950; // leaves room for the "[Topic] " prefix within the server's 1000-character limit

const CHANNELS = [
  { icon: Mail, label: 'Email', value: 'dummy.com' },
  { icon: Phone, label: 'Phone', value: '7592825349', href: 'tel:+917592825349' },
  { icon: MapPin, label: 'Visit us', value: '123 Market Street, Your City' },
];

const FAQ = [
  { q: 'How do I track my order?', a: 'Open My orders in your account. Each order shows live status, and we also email and notify you when it moves.' },
  { q: 'Can I cancel an order?', a: 'Yes — until it ships. Open the order and choose Cancel. Online payments are refunded to the original method.' },
  { q: 'Which payment methods do you accept?', a: 'Pay online with Razorpay, or choose Cash on Delivery at checkout.' },
];

export default function Contact() {
  const { user, isAuthenticated } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });
  const [topic, setTopic] = useState(TOPICS[0]);
  const [status, setStatus] = useState({ type: '', text: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ type: '', text: '' });
    setSending(true);
    try {
      const { data } = await api.post('/contact', { ...form, message: `[${topic}] ${form.message.trim()}` });
      setStatus({ type: 'success', text: data.message });
      setForm((f) => ({ ...f, message: '' }));
      setSent(true);
    } catch (err) {
      setStatus({ type: 'error', text: err.message || 'Could not send your message.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <section className="border-b border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Questions about an order or a product? Ask us.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-stone-600">A real person reads every message and replies.</p>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-5">
        {/* Form */}
        <div className="lg:col-span-3">
          {sent ? (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-8 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-bold text-gray-900">Message sent</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm text-gray-600">{status.text}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={() => { setSent(false); setStatus({ type: '', text: '' }); }} className="rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                  Send another
                </button>
                {isAuthenticated && (
                  <Link to="/messages" className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700">
                    Open my messages
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <fieldset>
                <legend className="text-sm font-medium text-gray-700">What's this about?</legend>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {TOPICS.map((t) => (
                    <label
                      key={t}
                      className={`flex min-h-10 items-center justify-center whitespace-normal rounded-full border px-2 py-2 text-center text-xs font-medium leading-tight transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary-300 sm:min-h-0 sm:px-4 sm:py-1.5 sm:text-sm ${
                        topic === t ? 'border-stone-900 bg-stone-900 text-white' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <input type="radio" name="topic" value={t} checked={topic === t} onChange={() => setTopic(t)} className="sr-only" />
                      {t}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your name</label>
                  <input id="name" required autoComplete="name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input id="email" type="email" required autoComplete="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className={inputClass} />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  minLength={10}
                  maxLength={MAX}
                  value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Include your order number if it's about an order."
                  className={inputClass}
                />
                <p className="mt-1 text-right text-xs text-gray-400">{form.message.length}/{MAX}</p>
              </div>

              {status.type === 'error' && <p role="alert" className="mt-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">{status.text}</p>}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-gray-500">
                  {isAuthenticated ? 'Our reply will appear in your Messages.' : <>Have an account? <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">Log in</Link> to get replies in-app.</>}
                </p>
                <button type="submit" disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60">
                  <Send className="h-4 w-4" aria-hidden="true" /> {sending ? 'Sending…' : 'Send message'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Channels + FAQ */}
        <aside className="space-y-8 lg:col-span-2">
          <ul className="space-y-3">
            {CHANNELS.map(({ icon: Icon, label, value, href }) => {
              const body = (
                <>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs text-gray-500">{label}</span>
                    <span className="block truncate text-sm font-semibold text-gray-900">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-primary-300">{body}</a>
                  ) : (
                    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>

          <div>
            <h2 className="font-display text-xl font-bold text-gray-900">Quick answers</h2>
            <div className="mt-3 divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white">
              {FAQ.map(({ q, a }) => (
                <details key={q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-gray-900 [&::-webkit-details-marker]:hidden">
                    {q}
                    <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400 transition group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
