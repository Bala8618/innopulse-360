import { useMemo, useState } from 'react';
import { FiBriefcase, FiMail, FiMessageSquare, FiUser } from 'react-icons/fi';
import AuthForm from '../components/AuthForm';
import Toast from '../components/common/Toast';

const defaultForm = { name: '', org: '', email: '', message: '' };

export default function Contact() {
  const [form, setForm] = useState(defaultForm);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const errors = useMemo(() => {
    const next = {};
    if (!form.name.trim()) next.name = 'Full name is required.';
    if (!form.org.trim()) next.org = 'Organization is required.';
    if (!/\S+@\S+\.\S+/.test(form.email)) next.email = 'Enter a valid email.';
    if (form.message.trim().length < 12) next.message = 'Tell us a bit more (min 12 characters).';
    return next;
  }, [form]);

  const showError = (field) => touched[field] && errors[field];

  const onSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, org: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    setLoading(true);
    setSubmitted(false);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setToast({ type: 'success', message: 'Request sent successfully!' });
    }, 1200);
  };

  return (
    <AuthForm
      title="Let’s build something impactful"
      subtitle="Tell us your goals and we’ll help you launch faster."
    >
      <h2 className="text-center text-2xl font-semibold text-slate-900 dark:text-white">Contact Sales & Support</h2>
      <p className="mt-1 text-center text-sm text-slate-500 dark:text-white/60">We’ll respond within 24 hours.</p>

      <form className="mt-6 space-y-4 text-left" onSubmit={onSubmit}>
        <div className="relative">
          <FiUser className="input-with-icon" />
          <input
            id="contact-name"
            className="input-field peer pl-10"
            placeholder=" "
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          />
          <label htmlFor="contact-name" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Full Name
          </label>
          {showError('name') && <p className="mt-1 text-xs text-rose-400">{errors.name}</p>}
        </div>

        <div className="relative">
          <FiBriefcase className="input-with-icon" />
          <input
            id="contact-org"
            className="input-field peer pl-10"
            placeholder=" "
            value={form.org}
            onChange={(e) => setForm({ ...form, org: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, org: true }))}
          />
          <label htmlFor="contact-org" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Organization
          </label>
          {showError('org') && <p className="mt-1 text-xs text-rose-400">{errors.org}</p>}
        </div>

        <div className="relative">
          <FiMail className="input-with-icon" />
          <input
            id="contact-email"
            className="input-field peer pl-10"
            placeholder=" "
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          />
          <label htmlFor="contact-email" className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-5 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Work Email
          </label>
          {showError('email') && <p className="mt-1 text-xs text-rose-400">{errors.email}</p>}
        </div>

        <div className="relative">
          <FiMessageSquare className="input-with-icon" />
          <textarea
            id="contact-message"
            className="input-field peer min-h-[120px] pl-10"
            placeholder=" "
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, message: true }))}
          />
          <label htmlFor="contact-message" className="pointer-events-none absolute left-10 top-4 text-xs text-slate-500 transition-all peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-sm peer-focus:-translate-y-3 peer-focus:text-xs peer-focus:text-indigo-300 dark:text-white/50">
            Message
          </label>
          {showError('message') && <p className="mt-1 text-xs text-rose-400">{errors.message}</p>}
        </div>

        <button className="btn-primary w-full py-3" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
              Sending...
            </span>
          ) : 'Send Request'}
        </button>

        {submitted && <p className="text-sm text-indigo-500 dark:text-indigo-300">Request sent successfully!</p>}
      </form>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </AuthForm>
  );
}
