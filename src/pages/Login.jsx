import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AuthShell, { inputClass } from '../components/AuthShell';
import OtpStep from '../components/OtpStep';

/** One form for both portals: `<Login />` is the shop login, `<Login admin />` the admin login. */
export default function Login({ admin = false }) {
  const { login, verifyLoginOtp, resendLoginOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState('credentials'); // 'credentials' | 'otp'
  const [otpEmail, setOtpEmail] = useState('');
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
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
      const { email } = await login(form);
      setOtpEmail(email || form.email);
      setStep('otp');
    } catch (err) {
      if (err.response?.data?.data?.needsVerification) {
        navigate('/verify-otp', { state: { email: form.email } });
        return;
      }
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(otp) {
    await verifyLoginOtp({ email: otpEmail, otp });
    navigate(location.state?.from || (admin ? '/admin' : '/'), { replace: true });
  }

  function backToCredentials() {
    setStep('credentials');
    setForm((prev) => ({ ...prev, password: '' }));
  }

  if (step === 'otp') {
    return (
      <AuthShell
        admin={admin}
        title="Check your email"
        subtitle="One more step to keep your account safe."
        footer={
          <Link to={admin ? '/admin/forgot-password' : '/forgot-password'} className="font-medium text-primary-600 hover:text-primary-700">
            Forgot your password?
          </Link>
        }
      >
        <OtpStep
          email={otpEmail}
          submitLabel={admin ? 'Verify & open admin' : 'Verify & log in'}
          onVerify={handleVerify}
          onResend={() => resendLoginOtp(otpEmail)}
          onBack={backToCredentials}
          backLabel="Back to log in"
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      admin={admin}
      title={admin ? 'Admin login' : 'Log in'}
      subtitle={admin ? 'Sign in to manage your store.' : 'Welcome back.'}
      footer={
        admin ? (
          <Link to="/" className="font-medium text-primary-600 hover:text-primary-700">
            ← Back to the shop
          </Link>
        ) : (
          <>
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </>
        )
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link
              to={admin ? '/admin/forgot-password' : '/forgot-password'}
              className="text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              required
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-2 top-1/2 mt-0.5 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-primary-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Sending code…' : 'Continue'}
        </button>
      </form>
    </AuthShell>
  );
}
