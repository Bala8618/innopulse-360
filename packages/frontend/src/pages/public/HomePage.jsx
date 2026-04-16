import { FiActivity, FiBarChart2, FiUsers } from 'react-icons/fi';
import Hero from '../../components/marketing/Hero';

const steps = [
  {
    title: 'Create Program',
    description: 'Launch a structured innovation program with roles, timelines, and success criteria.',
    icon: FiActivity
  },
  {
    title: 'Manage Participants',
    description: 'Onboard teams, assign mentors, and keep approvals moving without bottlenecks.',
    icon: FiUsers
  },
  {
    title: 'Analyze Results',
    description: 'Track impact, engagement, and outcomes with decision-ready analytics.',
    icon: FiBarChart2
  }
];

export default function HomePage() {
  return (
    <section className="space-y-12">
      <Hero />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Overview</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Built for innovation leaders who need clarity, control, and measurable outcomes.
            </h2>
            <p className="mt-4 text-sm text-slate-600">
              InnoPulse 360 unifies registration, mentoring, evaluation, and reporting so you can move faster without losing governance.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ['Idea Intake', 'Capture ideas, auto-tag domains, and track submissions in minutes.'],
              ['Collaboration Hub', 'Assign mentors, host sessions, and manage feedback loops.'],
              ['Execution Tracker', 'Move teams through milestones with SLAs and audit trails.'],
              ['Impact Reporting', 'Export KPIs and performance summaries for stakeholders.']
            ].map(([title, desc]) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                <p className="mt-2 text-xs text-slate-600">{desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">How It Works</p>
          <h2 className="text-3xl font-bold text-slate-900">From setup to outcomes in three steps</h2>
          <p className="text-sm text-slate-600">Each step is designed to remove uncertainty and keep every stakeholder aligned.</p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <article key={step.title} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white">
                  <Icon className="text-xl" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Step {idx + 1}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                {idx < steps.length - 1 && (
                  <span className="pointer-events-none absolute right-[-18px] top-[54px] hidden h-px w-10 bg-gradient-to-r from-indigo-400 to-purple-400 md:block" />
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
