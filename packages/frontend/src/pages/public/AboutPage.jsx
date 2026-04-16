import { FiAward, FiFlag, FiTrendingUp } from 'react-icons/fi';
import FadeInSection from '../../components/common/FadeInSection';

const milestones = [
  { year: '2019', text: 'Built the first end-to-end hackathon operations prototype.', icon: FiFlag },
  { year: '2022', text: 'Expanded to multi-institution and corporate innovation programs.', icon: FiTrendingUp },
  { year: '2025', text: 'Launched analytics-first event governance suite at national scale.', icon: FiAward }
];

export default function AboutPage() {
  return (
    <section className="space-y-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="font-display text-3xl font-bold text-slate-900">About InnoPulse 360</h1>
        <p className="mt-4 text-slate-600">
          InnoPulse 360 was engineered for event operators who need reliability, control, and measurable impact. The platform
          unifies process execution and performance analytics so leadership teams can make faster decisions with confidence.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Our Journey</p>
          <h2 className="text-2xl font-bold text-slate-900">A timeline of product evolution</h2>
          <p className="text-sm text-slate-600">Key milestones that shaped the platform into a commercial-grade SaaS.</p>
        </div>

        <div className="mt-8 space-y-6 border-l border-slate-200 pl-6">
          {milestones.map((item) => {
            const Icon = item.icon;
            return (
              <FadeInSection key={item.year} className="relative">
                <div className="absolute -left-9 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg">
                  <Icon />
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-indigo-600">{item.year}</p>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </div>
              </FadeInSection>
            );
          })}
        </div>
      </div>
    </section>
  );
}
