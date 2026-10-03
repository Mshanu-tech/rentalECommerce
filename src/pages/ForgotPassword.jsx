import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import * as authService from '../services/authService';
import AuthShell, { inputClass } from '../components/AuthShell';

/** Two steps on one page: ask for the email, then enter the emailed code + a new password. */
export default function ForgotPassword({ admin = false }) {
  const loginPath = admin ? '/admin/login' : '/login';
  const portal = admin ? 'admin' : 'customer';

  const [step, setStep] = useState('email'); // 'email' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ otp: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function requestCode(e) {
    e?.preventDefault();
    setError('');
    setInfo('');
    setSubmitting(true);
    try {
      const message = await authService.forgotPasswordRequest({ email, portal });
      setInfo(message);
      setStep('reset');
    } catch (err) {
      setError(err.message || 'Could not send the code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function resetPassword(e) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSubmitting(true);
    try {
      await authService.resetPasswordRequest({ email, otp: form.otp, password: form.password, portal });
      setStep('done');
    } catch (err) {
      setError(err.message || 'Could not reset your password.');
    } finally {
      setSubmitting(false);
    }
  }

  const backLink = (
    <Link to={loginPath} className="font-medium text-primary-600 hover:text-primary-700">
      ← Back to log in
    </Link>
  );

  if (step === 'done') {
    return (
      <AuthShell admin={admin} title="Password updated" footer={null}>
        <div className="flex flex-col items-center text-center">
          <CheckCircle2 className="h-12 w-12 text-green-500" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-600">Your password has been changed. You can log in with it now.</p>
          <Link
            to={loginPath}
            className="mt-6 w-full rounded-full bg-primary-600 px-5 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-primary-700"
          >
            Go to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      admin={admin}
      title="Forgot your password?"
      subtitle={
        step === 'email'
          ? "Enter your email and we'll send you a 6-digit code."
          : `Enter the code we sent to ${email} and choose a new password.`
      }
      footer={backLink}
    >
      {step === 'email' ? (
        <form onSubmit={requestCode} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className={inputClass}
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Sending…' : 'Send reset code'}
          </button>
        </form>
      ) : (
        <form onSubmit={resetPassword} className="space-y-4">
          {info && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{info}</p>}
          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
              6-digit code
            </label>
            <input
              id="otp"
              inputMode="numeric"
              maxLength={6}
              value={form.otp}
              onChange={(e) => setForm((f) => ({ ...f, otp: e.target.value.replace(/\D/g, '') }))}
              required
              autoFocus
              className={`${inputClass} text-center text-lg tracking-[0.5em]`}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
              className={inputClass}
            />
            <p className="mt-1 text-xs text-gray-400">At least 8 characters, with a letter and a number.</p>
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
              Confirm new password
            </label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={form.confirm}
              onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
              required
              className={inputClass}
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
          >
            {submitting ? 'Updating…' : 'Reset password'}
          </button>
          <button
            type="button"
            onClick={requestCode}
            disabled={submitting}
            className="w-full text-center text-sm font-medium text-gray-500 hover:text-gray-700"
          >
            Didn't get a code? Send again
          </button>
        </form>
      )}
    </AuthShell>
  );
}
