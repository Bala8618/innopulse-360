import { Link } from 'react-router-dom';

export default function AdminPortal() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold dark:text-white">Admin Portal</h1>
      <p className="text-sm text-slate-600 dark:text-slate-300">Admin handles event creation and process oversight.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <Link className="rounded-xl border p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" to="/saas/event-creation">
          <p className="font-semibold dark:text-white">Event Creation</p>
          <p className="text-sm text-slate-500">Create events with timeline, fee, and rules.</p>
        </Link>
        <Link className="rounded-xl border p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" to="/saas/event-management">
          <p className="font-semibold dark:text-white">Event Management Dashboard</p>
          <p className="text-sm text-slate-500">Plan logistics and approve operations.</p>
        </Link>
        <Link className="rounded-xl border p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" to="/saas/event-flow">
          <p className="font-semibold dark:text-white">Event Flow Diagram</p>
          <p className="text-sm text-slate-500">Visual workflow for each event.</p>
        </Link>
        <Link className="rounded-xl border p-4 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" to="/saas/participant-approval">
          <p className="font-semibold dark:text-white">Participant Approval</p>
          <p className="text-sm text-slate-500">Approve/reject participant registrations.</p>
        </Link>
      </div>
    </div>
  );
}
