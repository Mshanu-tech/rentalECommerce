import { useEffect, useRef, useState } from 'react';
import { MailCheck } from 'lucide-react';

const LENGTH = 6;
const RESEND_SECONDS = 60;

/** Six separate boxes that behave like one field: auto-advance, backspace, arrow keys and paste. */
export function OtpInput({ value, onChange, disabled, hasError }) {
  const refs = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

  function focusAt(i) {
    refs.current[Math.max(0, Math.min(LENGTH - 1, i))]?.focus();
  }

  function handleChange(i, e) {
    const typed = e.target.value.replace(/\D/g, '');
    if (!typed) return;
    const next = digits.slice();
    // Typing several digits at once (autofill / SMS suggestion) fills forward from this box.
    typed
      .slice(0, LENGTH - i)
      .split('')
      .forEach((d, k) => {
        next[i + k] = d;
      });
    onChange(next.join('').slice(0, LENGTH));
    focusAt(i + typed.length);
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = digits.slice();
      if (next[i]) {
        next[i] = '';
        onChange(next.join(''));
      } else if (i > 0) {
        next[i - 1] = '';
        onChange(next.join(''));
        focusAt(i - 1);
      }
    } else if (e.key === 'ArrowLeft') focusAt(i - 1);
    else if (e.key === 'ArrowRight') focusAt(i + 1);
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!pasted) return;
    e.preventDefault();
    onChange(pasted);
    focusAt(pasted.length >= LENGTH ? LENGTH - 1 : pasted.length);
  }

  return (
    <div className="flex justify-between gap-2 sm:gap-3" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          autoFocus={i === 0}
          maxLength={LENGTH}
          disabled={disabled}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
          className={`h-14 w-full min-w-0 rounded-xl border bg-white text-center text-2xl font-semibold text-gray-900 shadow-sm transition focus:outline-none focus:ring-2 disabled:opacity-60 ${
            hasError
              ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
              : d
                ? 'border-primary-400 focus:border-primary-500 focus:ring-primary-200'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200'
          }`}
        />
      ))}
    </div>
  );
}

/**
 * The "enter the code we emailed you" step shared by sign-up verification and the two-step login.
 * The parent supplies what verifying / resending actually do; this owns the input, the
 * error/notice messages and the resend cooldown.
 */
export default function OtpStep({ email, onVerify, onResend, submitLabel = 'Verify', onBack, backLabel = 'Use a different email' }) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit(e) {
    e?.preventDefault();
    if (otp.length !== LENGTH || submitting) return;
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await onVerify(otp);
    } catch (err) {
      setError(err.message || 'That code did not work. Please try again.');
      setOtp('');
    } finally {
      setSubmitting(false);
    }
  }

  async function resend() {
    setError('');
    setNotice('');
    try {
      await onResend();
      setNotice('A new code is on its way.');
      setOtp('');
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || 'Could not resend the code.');
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl bg-primary-50 p-3.5 text-sm text-primary-900">
        <MailCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary-600" aria-hidden="true" />
        <p>
          We emailed a 6-digit code to <strong className="break-all">{email}</strong>. It expires in 10 minutes.
        </p>
      </div>

      <OtpInput
        value={otp}
        onChange={(v) => {
          setOtp(v);
          if (error) setError('');
        }}
        disabled={submitting}
        hasError={Boolean(error)}
      />

      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}
      {notice && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{notice}</p>}

      <button
        type="submit"
        disabled={submitting || otp.length !== LENGTH}
        className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Checking…' : submitLabel}
      </button>

      <div className="flex items-center justify-between text-sm">
        {onBack ? (
          <button type="button" onClick={onBack} className="font-medium text-gray-500 hover:text-gray-800">
            {backLabel}
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="font-medium text-primary-600 hover:text-primary-700 disabled:cursor-not-allowed disabled:text-gray-400"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}
