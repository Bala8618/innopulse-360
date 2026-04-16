import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/authService';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await AuthService.login(form);
      const role = data?.user?.role;
      if (role !== 'admin') {
        setError('This portal is only for admin.');
        return;
      }
      localStorage.setItem('innopulse_user', JSON.stringify(data.user));
      navigate('/admin-innopulse-control');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="grid min-h-[70vh] gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-600 p-8 text-white shadow-2xl">
        <div className="absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-12 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Admin Access</p>
          <h1 className="font-display text-3xl font-bold">Control Center</h1>
          <p className="text-white/90">Secure access for platform administrators and program directors.</p>
          <p className="text-sm text-white/80">Route: /admin-innopulse-control</p>
        </div>
      </article>

      <form className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl" onSubmit={onSubmit}>
        <h2 className="font-display text-2xl font-semibold text-slate-900">Admin Login</h2>
        <p className="mt-1 text-sm text-slate-600">Authenticate to access the control workspace.</p>

        <div className="mt-6 space-y-4">
          <div className="relative">
            <FiMail className="input-with-icon" />
            <label htmlFor="admin-email" className="sr-only">Work Email</label>
            <input
              id="admin-email"
              className="input-field pl-10"
              placeholder="Work Email"
              type="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="relative">
            <FiLock className="input-with-icon" />
            <label htmlFor="admin-password" className="sr-only">Password</label>
            <input
              id="admin-password"
              className="input-field pl-10 pr-10"
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              aria-label="Toggle password"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>

          {error && <p className="text-sm text-rose-600">{error}</p>}

          <button className="btn-primary w-full py-3" type="submit">
            Login
          </button>
        </div>
      </form>
    </section>
  );
}
