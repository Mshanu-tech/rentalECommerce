import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AuthShell, { inputClass } from '../components/AuthShell';
import OtpStep from '../components/OtpStep';

/** Sign-up verification: proves the person owns the email they registered with. */
export default function VerifyOtp() {
  const { verifyOtp, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Arrives with the email from Register/Login; if someone opens the URL directly, ask for it.
  const [email, setEmail] = useState(location.state?.email || '');
  const [confirmed, setConfirmed] = useState(Boolean(location.state?.email));

  async function handleVerify(otp) {
    await verifyOtp({ email, otp });
    navigate('/account', { replace: true });
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle="Your account is created once you confirm this email address is yours."
      footer={
        <>
          Wrong details?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
            Start again
          </Link>
        </>
      }
    >
      {confirmed ? (
        <OtpStep
          email={email}
          submitLabel="Verify & continue"
          onVerify={handleVerify}
          onResend={() => resendOtp(email)}
          onBack={() => setConfirmed(false)}
        />
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setConfirmed(true);
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email you signed up with
            </label>
            <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" className="w-full rounded-full bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700">
            Continue
          </button>
        </form>
      )}
    </AuthShell>
  );
}
