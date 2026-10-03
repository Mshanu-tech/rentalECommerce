import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthShell, { inputClass } from '../components/AuthShell';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { email } = await register(form);
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="We'll email a 6-digit code to confirm the address is really yours."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" name="name" autoComplete="name" value={form.name} onChange={handleChange} required />
        <Field label="Email" name="email" type="email" autoComplete="email" value={form.email} onChange={handleChange} required hint="Use an address you can open right now — the code goes here." />
        <Field label="Phone (optional)" name="phone" type="tel" autoComplete="tel" value={form.phone} onChange={handleChange} />
        <Field label="Password" name="password" type="password" autoComplete="new-password" value={form.password} onChange={handleChange} required hint="At least 8 characters, with a letter and a number." />

        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending code…' : 'Send verification code'}
        </button>
      </form>
    </AuthShell>
  );
}

function Field({ label, name, type = 'text', value, onChange, required, hint, autoComplete }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input id={name} name={name} type={type} value={value} onChange={onChange} required={required} autoComplete={autoComplete} className={inputClass} />
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
