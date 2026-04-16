import { FiCheckCircle } from 'react-icons/fi';

const defaultBullets = [
  'Real-time analytics',
  'Smart collaboration',
  'Scalable programs'
];

export default function AuthForm({
  children,
  label = 'INNOVATION OPERATIONS CLOUD',
  title = 'Welcome to InnoPulse 360',
  subtitle = 'Built for enterprise innovation teams that need clarity and speed.',
  bullets = defaultBullets,
  cta
}) {
  return (
    <section className="page-fade-in grid min-h-[70vh] gap-6 py-12 px-6 lg:grid-cols-[1.05fr_0.95fr]">
      <article className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#111827] p-8 text-white shadow-lg">
        <div className="absolute -left-20 top-0 h-48 w-48 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="relative space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">{label}</p>
          <h1 className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="text-sm text-white/70">{subtitle}</p>
          <ul className="mt-6 space-y-2 text-sm text-white/80">
            {bullets.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <FiCheckCircle className="text-indigo-300" /> {item}
              </li>
            ))}
          </ul>
          {cta && <div className="pt-2">{cta}</div>}
        </div>
      </article>

      <div className="glass-card mx-auto w-full max-w-xl p-8 text-slate-900 dark:text-white shadow-lg">
        {children}
      </div>
    </section>
  );
}
