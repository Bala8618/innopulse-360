import { useState } from 'react';
import { AuthService } from '../../services/authService';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const { data } = await AuthService.forgotPassword({ email });
    setMessage(data.message);
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="font-display text-2xl font-bold dark:text-white">Forgot Password</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
        {message && <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>}
        <button className="w-full rounded-lg bg-brand-700 py-2 font-semibold text-white">Send Reset Link</button>
      </form>
    </section>
  );
}
