import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-14 text-white shadow-2xl md:px-12 md:py-20">
      <div className="absolute inset-0 hero-animated-bg opacity-80" />
      <div className="absolute -left-24 top-8 h-56 w-56 rounded-full bg-indigo-500/40 blur-3xl animate-glow-shift" />
      <div className="absolute -bottom-24 right-10 h-64 w-64 rounded-full bg-blue-400/40 blur-3xl animate-glow-shift" />
      <div className="absolute right-24 top-20 h-24 w-24 rounded-full bg-purple-500/60 blur-2xl animate-float" />

      <div className="relative grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">Innovation Operations Cloud</p>
          <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
            Build programs that turn{' '}
            <span className="bg-gradient-to-r from-indigo-200 via-white to-purple-200 bg-clip-text text-transparent">ideas into outcomes</span>
          </h1>
          <p className="max-w-xl text-base text-indigo-100 md:text-lg">
            Launch innovation programs, keep every stakeholder aligned, and measure impact with a single command center.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-sm">
              Start Free Pilot
            </Link>
            <Link
              to="/features"
              className="rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-lg"
            >
              Explore Features
            </Link>
          </div>
          <p className="text-sm text-indigo-200">Trusted by innovation teams at universities, incubators, and enterprise labs.</p>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-3xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-xl animate-float">
            <div className="flex items-center justify-between text-xs text-indigo-100">
              <span className="rounded-full bg-white/20 px-3 py-1">Live Dashboard</span>
              <span>InnoPulse 360</span>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
                <p className="text-xs uppercase text-indigo-200">Active Programs</p>
                <p className="mt-2 text-3xl font-bold">42</p>
                <div className="mt-3 h-2 w-full rounded-full bg-white/10">
                  <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-cyan-300 to-indigo-400" />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs uppercase text-indigo-200">Mentor Hours</p>
                  <p className="mt-2 text-xl font-semibold">1.2K</p>
                </div>
                <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                  <p className="text-xs uppercase text-indigo-200">Ideas Tracked</p>
                  <p className="mt-2 text-xl font-semibold">8,640</p>
                </div>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 p-3">
                <div className="flex items-center justify-between text-xs text-indigo-200">
                  <span>Workflow Velocity</span>
                  <span className="text-emerald-200">+18%</span>
                </div>
                <div className="mt-2 h-10 w-full rounded-xl bg-gradient-to-r from-indigo-400/60 via-cyan-300/60 to-purple-400/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
