import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AuthService } from '../../services/authService';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    const { data } = await AuthService.resetPassword(token, { password });
    setMessage(data.message);
  };

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h1 className="font-display text-2xl font-bold dark:text-white">Reset Password</h1>
      <form className="mt-4 space-y-3" onSubmit={onSubmit}>
        <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="password" placeholder="New Password" onChange={(e) => setPassword(e.target.value)} required />
        {message && <p className="text-sm text-green-700">{message}</p>}
        <button className="w-full rounded-lg bg-brand-700 py-2 font-semibold text-white">Reset Password</button>
      </form>
    </section>
  );
}
