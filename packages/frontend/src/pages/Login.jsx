import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AuthService } from '../services/authService';
import AuthForm from '../components/AuthForm';
import Toast from '../components/common/Toast';

export default function Login() {
  const navigate = useNavigate();
  const { role } = useParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const validRoles = ['admin', 'participant', 'event_management', 'college_management', 'mentor', 'reports_team'];
  const expectedRole = validRoles.includes(role) ? role : '';

  const validate = () => {
    const next = {};
    if (!form.email) next.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email.';
    if (!form.password) next.password = 'Password is required.';
    else if (form.password.length < 6) next.password = 'Password must be at least 6 characters.';
    return next;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setLoading(true);
    try {
      const { data } = await AuthService.login(form);
      if (expectedRole && data?.user?.role !== expectedRole) {
        setErrors({ password: `This login page is for ${expectedRole.replace('_', ' ')} role only.` });
        return;
      }
      localStorage.setItem('innopulse_user', JSON.stringify(data.user));
      setToast({ type: 'success', message: 'Logged in successfully.' });
      navigate(data.redirectTo || '/saas/dashboard');
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Login failed.' });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    setToast({ type: 'error', message: 'Google sign-in is unavailable without Firebase.' });
  };

  return (
    <AuthForm
      title="Welcome back to InnoPulse"
      subtitle="Sign in to your workspace and keep innovation moving forward."
    >
      <h2 className="text-center text-2xl font-semibold text-slate-900 dark:text-white">Sign in</h2>
      {expectedRole && (
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-white/60">Role login: <span className="font-semibold capitalize text-slate-900 dark:text-white">{expectedRole.replace('_', ' ')}</span></p>
      )}

      <button type="button" className="mt-6 w-full rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-slate-900" onClick={onGoogle} disabled={loading}>
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400 dark:text-white/40">
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        OR
        <span className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <form className="space-y-4 text-left" onSubmit={onSubmit}>
        <div className="relative">
          <FiMail className="input-with-icon" />
          <input
            id="login-email"
            className="input-field peer pl-10"
            placeholder=" "
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
          />
          <label htmlFor="login-email" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Email
          </label>
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
        </div>

        <div className="relative">
          <FiLock className="input-with-icon" />
          <input
            id="login-password"
            className="input-field peer pl-10 pr-10"
            placeholder=" "
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
          />
          <label htmlFor="login-password" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Password
          </label>
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 dark:text-white/50 dark:hover:text-white"
            aria-label="Toggle password"
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password}</p>}
        </div>

        <button className="btn-primary w-full py-3" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
              Signing in...
            </span>
          ) : 'Login'}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between text-sm">
        <Link to="/forgot-password" className="text-indigo-500 dark:text-indigo-300">Forgot Password?</Link>
        <Link to="/register" className="text-indigo-500 dark:text-indigo-300">Create Account</Link>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AuthForm>
  );
}
