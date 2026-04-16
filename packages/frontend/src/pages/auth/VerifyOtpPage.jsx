import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthService } from '../../services/authService';

export default function VerifyOtpPage() {
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState(location.state?.devOtp || '');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    await AuthService.verifyOtp({ email, otp });
    setMessage('OTP verified. You can login now.');
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="font-display text-2xl font-bold dark:text-white">Verify OTP</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={email} placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={otp} placeholder="6-digit OTP" onChange={(e) => setOtp(e.target.value)} required />
        {location.state?.devOtp && (
          <p className="text-xs text-amber-700">Dev OTP autofilled because SMTP is not configured.</p>
        )}
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button className="w-full rounded-lg bg-brand-700 py-2 font-semibold text-white">Verify</button>
      </form>
    </section>
  );
}
