import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { AuthService } from '../services/authService';
import AuthForm from '../components/AuthForm';
import Toast from '../components/common/Toast';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required.';
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
      const payload = { ...form, role: 'participant' };
      const { data } = await AuthService.register(payload);
      const successMessage = data?.devOtp
        ? `${data.message} OTP: ${data.devOtp}`
        : 'Registration successful. Verify OTP.';
      setToast({ type: 'success', message: successMessage });
      navigate('/verify-otp', { state: { email: form.email, devOtp: data?.devOtp || '' } });
    } catch (err) {
      setToast({ type: 'error', message: err?.response?.data?.message || 'Registration failed.' });
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = () => {
    setToast({ type: 'error', message: 'Google sign-in is unavailable without Firebase.' });
  };

  return (
    <AuthForm
      title="Start your innovation journey"
      subtitle="Create an account to launch programs, manage teams, and track outcomes."
    >
      <h2 className="text-center text-2xl font-semibold text-slate-900 dark:text-white">Create your account</h2>
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
          <FiUser className="input-with-icon" />
          <input
            id="register-name"
            className="input-field peer pl-10"
            placeholder=" "
            value={form.name}
            onChange={(e) => {
              setForm({ ...form, name: e.target.value });
              setErrors((prev) => ({ ...prev, name: '' }));
            }}
          />
          <label htmlFor="register-name" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Full Name
          </label>
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
        </div>

        <div className="relative">
          <FiMail className="input-with-icon" />
          <input
            id="register-email"
            className="input-field peer pl-10"
            placeholder=" "
            type="email"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setErrors((prev) => ({ ...prev, email: '' }));
            }}
          />
          <label htmlFor="register-email" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Work Email
          </label>
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
        </div>

        <div className="relative">
          <FiLock className="input-with-icon" />
          <input
            id="register-password"
            className="input-field peer pl-10 pr-10"
            placeholder=" "
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => {
              setForm({ ...form, password: e.target.value });
              setErrors((prev) => ({ ...prev, password: '' }));
            }}
          />
          <label htmlFor="register-password" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
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
              Creating account...
            </span>
          ) : 'Create Account'}
        </button>
      </form>

      <Link to="/login" className="mt-4 block text-sm text-indigo-500 dark:text-indigo-300">
        Already have an account? Login
      </Link>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AuthForm>
  );
}
