import { Link } from 'react-router-dom';

const stats = [
  { label: 'Programs Managed', value: '120+' },
  { label: 'Participants', value: '48K+' },
  { label: 'Avg Ops Efficiency', value: '92%' }
];

export default function DashboardHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-12 text-white shadow-xl md:px-10 md:py-16">
      <div className="absolute inset-0 hero-animated-bg opacity-80" />
      <div className="absolute -right-24 top-8 h-64 w-64 rounded-full bg-cyan-400/30 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-48 w-48 rounded-full bg-indigo-500/30 blur-3xl" />

      <div className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-200">Innovation Operations Cloud</p>
          <h2 className="text-3xl font-extrabold leading-tight md:text-4xl">
            Run events with clarity, alignment, and decision-ready insights
          </h2>
          <p className="max-w-2xl text-sm text-cyan-100 md:text-base">
            InnoPulse 360 connects registration, logistics, mentoring, jury workflows, and analytics into a single enterprise command center.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-5 py-2.5 text-sm">
              Start Free Pilot
            </Link>
            <Link
              to="/features"
              className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg"
            >
              Explore Features
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {stats.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              <p className="text-xs uppercase text-cyan-200">{item.label}</p>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
