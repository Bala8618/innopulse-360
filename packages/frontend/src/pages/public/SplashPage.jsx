import { useNavigate } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';

export default function SplashPage() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b1120] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#111827]" />
      <div className="absolute -left-32 top-8 h-72 w-72 rounded-full bg-indigo-500/25 blur-[140px] animate-float-slow" />
      <div className="absolute -right-40 bottom-8 h-80 w-80 rounded-full bg-purple-500/25 blur-[160px] animate-float-tilt" />
      <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:24px_24px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-6 text-center">
        <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
          Process Performance Dashboard
        </div>
        <h1 className="font-display text-5xl font-extrabold leading-tight md:text-6xl">
          InnoPulse <span className="bg-gradient-to-r from-indigo-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">360</span>
        </h1>
        <p className="max-w-2xl text-lg text-white/80">
          The innovation operating system that keeps every program aligned, measurable, and ready to scale.
        </p>
        <div className="h-1 w-24 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
        <div className="inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-white/55">
          <span>Events</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Hackathons</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>Process performance</span>
        </div>
        <div className="inline-flex items-center gap-3 text-xs text-white/50">
          <span>120+ programs</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>9 departments</span>
          <span className="h-1 w-1 rounded-full bg-white/30" />
          <span>38 decisions this week</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate('/home')}
            className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 px-7 py-3 font-semibold text-white shadow-[0_18px_40px_rgba(99,102,241,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(147,51,234,0.45)]"
          >
            Launch Command Center <FiArrowRight className="ml-2 inline" />
          </button>
        </div>
      </div>
    </section>
  );
}
