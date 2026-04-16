import { FiActivity, FiBarChart2, FiBriefcase, FiShield, FiUsers, FiZap } from 'react-icons/fi';

const features = [
  {
    title: 'Unified Lifecycle',
    description: 'Connect registration, submissions, mentoring, evaluation, and outcomes in one auditable workflow.',
    icon: FiActivity
  },
  {
    title: 'Role-Based Workspaces',
    description: 'Tailored experiences for participants, mentors, jury members, and ops teams with smart permissions.',
    icon: FiUsers
  },
  {
    title: 'Decision-Ready Analytics',
    description: 'Track engagement, throughput, and impact with dashboards built for leadership reviews.',
    icon: FiBarChart2
  },
  {
    title: 'Enterprise Controls',
    description: 'Governance tooling for approvals, compliance trails, and SLA monitoring at scale.',
    icon: FiShield
  },
  {
    title: 'Program Templates',
    description: 'Launch new programs faster with reusable workflows, milestones, and scoring frameworks.',
    icon: FiBriefcase
  },
  {
    title: 'Automation Engine',
    description: 'Reduce manual overhead with notifications, reminders, and real-time task orchestration.',
    icon: FiZap
  }
];

export default function Features() {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Platform Features</p>
        <h3 className="text-3xl font-bold text-slate-900">Everything needed to run innovation programs at scale</h3>
        <p className="max-w-2xl text-sm text-slate-600">
          Each module answers a clear question: what is happening, who owns it, and what action should happen next.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="rounded-2xl bg-gradient-to-br from-indigo-200/60 via-blue-200/40 to-purple-200/40 p-[1px]">
              <div className="group h-full rounded-2xl bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 transition-all duration-300 group-hover:bg-indigo-600 group-hover:text-white">
                  <Icon className="text-xl" />
                </div>
                <h4 className="mt-4 text-lg font-semibold text-slate-900">{item.title}</h4>
                <p className="mt-2 text-sm text-slate-600">{item.description}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
