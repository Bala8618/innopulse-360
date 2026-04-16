import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, Controls, MarkerType, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { SaasApi } from '../../services/saasApi';

function buildFlow(flow = []) {
  const palettes = [
    { from: '#4f46e5', to: '#6366f1' },
    { from: '#0ea5e9', to: '#06b6d4' },
    { from: '#16a34a', to: '#22c55e' },
    { from: '#f59e0b', to: '#f97316' },
    { from: '#db2777', to: '#ec4899' },
    { from: '#7c3aed', to: '#8b5cf6' },
    { from: '#2563eb', to: '#3b82f6' },
    { from: '#059669', to: '#10b981' },
    { from: '#e11d48', to: '#f43f5e' }
  ];
  const nodes = flow.map((step, idx) => ({
    id: step.id,
    position: { x: idx % 2 ? 470 : 80, y: idx * 110 },
    data: { label: `${step.label}\n${step.date ? new Date(step.date).toLocaleDateString() : ''}` },
    style: {
      border: '1px solid rgba(255,255,255,0.22)',
      borderRadius: 14,
      background: `linear-gradient(135deg, ${palettes[idx % palettes.length].from}, ${palettes[idx % palettes.length].to})`,
      color: '#fff',
      width: 300,
      fontSize: 12,
      fontWeight: 700,
      padding: 12,
      boxShadow: '0 10px 24px rgba(2,6,23,0.2)'
    }
  }));
  const edges = flow.slice(1).map((step, idx) => ({
    id: `e-${flow[idx].id}-${step.id}`,
    source: flow[idx].id,
    target: step.id,
    type: 'smoothstep',
    animated: true,
    style: { stroke: palettes[idx % palettes.length].to, strokeWidth: 2.5 },
    markerEnd: { type: MarkerType.ArrowClosed }
  }));
  return { nodes, edges };
}

export default function EventFlowPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [flowPayload, setFlowPayload] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    SaasApi.getEvents({ page: 1, limit: 100 })
      .then((res) => {
        setEvents(res.data.data || []);
        setError('');
      })
      .catch((err) => setError(err?.response?.data?.message || 'Unable to load events. Configure MySQL.'));
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    SaasApi.getEventFlow(selectedId).then((res) => setFlowPayload(res.data));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return events;
    return events.filter((e) => e.event_name.toLowerCase().includes(q));
  }, [events, search]);

  const graph = useMemo(() => buildFlow(flowPayload?.flow || []), [flowPayload]);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <aside className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold dark:text-white">Event Flow Diagram</h1>
        {error && <p className="mt-2 rounded bg-amber-50 px-2 py-1 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">{error}</p>}
        <input className="mt-3 w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="mt-3 max-h-[65vh] space-y-2 overflow-y-auto">
          {filtered.map((ev) => (
            <button
              key={ev.id}
              onClick={() => setSelectedId(ev.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-sm ${selectedId === ev.id ? 'border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}
            >
              <p className="font-semibold">{ev.event_name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{ev.organizer}</p>
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {selectedId ? (
          <div className="h-[72vh] rounded-lg border border-slate-200 bg-gradient-to-br from-indigo-50 via-sky-50 to-cyan-50 dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40">
            <ReactFlow nodes={graph.nodes} edges={graph.edges} fitView>
              <MiniMap pannable zoomable />
              <Background gap={24} size={1} />
              <Controls />
            </ReactFlow>
          </div>
        ) : (
          <div className="flex h-[72vh] items-center justify-center text-slate-500 dark:text-slate-400">Select an event to view workflow.</div>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">Created</span>
          <span className="rounded-full bg-sky-100 px-2 py-1 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200">Registration</span>
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">Screening</span>
          <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200">Execution</span>
          <span className="rounded-full bg-rose-100 px-2 py-1 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">Results</span>
        </div>
      </section>
    </div>
  );
}
