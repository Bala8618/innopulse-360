import { useState, useEffect, useMemo } from 'react';
import { DashboardService } from '../services/dashboardService';
import DataTable from '../common/DataTable';
import ConfirmModal from '../common/ConfirmModal';

function formatDate(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString();
}

export default function AdminEventManagement() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [notice, setNotice] = useState({ type: '', text: '' });
  const [modal, setModal] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [actionBusy, setActionBusy] = useState(false);

  const [eventForm, setEventForm] = useState({
    title: '',
    organizer: '',
    description: '',
    eventType: 'team',
    minTeamSize: 1,
    maxTeamSize: 5,
    prizePool: '',
    prizeDetails: '',
    workflowNotes: '',
    registrationStartDate: '',
    registrationDeadline: '',
    startDate: '',
    endDate: '',
    round1Name: 'Round 1',
    round1StartDate: '',
    round1EndDate: '',
    round2Name: 'Round 2',
    round2StartDate: '',
    round2EndDate: '',
    status: 'open',
    domains: ''
  });
  const [editingEventId, setEditingEventId] = useState('');
  const [eventLifecycleFilter, setEventLifecycleFilter] = useState('all');

  async function refreshAdminData() {
    try {
      setLoading(true);
      const result = await DashboardService.adminEvents();
      setRows(result.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshAdminData();
  }, []);

  useEffect(() => {
    if (!notice.text) return undefined;
    const timer = setTimeout(() => setNotice({ type: '', text: '' }), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  async function onCreateEvent(e) {
    e.preventDefault();
    setFormMessage('');
    try {
      if (editingEventId) {
        await DashboardService.adminUpdateEvent(editingEventId, eventForm);
        setFormMessage('Event updated successfully');
        setNotice({ type: 'success', text: 'Event updated successfully' });
      } else {
        await DashboardService.adminCreateEvent(eventForm);
        setFormMessage('Event created successfully');
        setNotice({ type: 'success', text: 'Event created successfully' });
      }
      setEventForm({
        title: '',
        organizer: '',
        description: '',
        eventType: 'team',
        minTeamSize: 1,
        maxTeamSize: 5,
        prizePool: '',
        prizeDetails: '',
        workflowNotes: '',
        registrationStartDate: '',
        registrationDeadline: '',
        startDate: '',
        endDate: '',
        round1Name: 'Round 1',
        round1StartDate: '',
        round1EndDate: '',
        round2Name: 'Round 2',
        round2StartDate: '',
        round2EndDate: '',
        status: 'open',
        domains: ''
      });
      setEditingEventId('');
      await refreshAdminData();
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 'Event creation failed';
      setFormMessage(errorMessage);
      setNotice({ type: 'error', text: errorMessage });
    }
  }

  function openConfirm(titleText, descriptionText, callback) {
    setModal({
      open: true,
      title: titleText,
      description: descriptionText,
      onConfirm: async () => {
        setActionBusy(true);
        try {
          await callback();
          setModal({ open: false, title: '', description: '', onConfirm: null });
          setNotice({ type: 'success', text: 'Action completed successfully' });
        } catch (err) {
          setNotice({ type: 'error', text: err?.response?.data?.message || 'Action failed' });
        } finally {
          setActionBusy(false);
        }
      }
    });
  }

  const eventActions = [
    {
      label: 'Edit',
      onClick: (row) => {
        setEditingEventId(row._id);
        setEventForm({
          title: row.title || '',
          organizer: row.organizer || '',
          description: row.description || '',
          eventType: row.eventType || 'team',
          minTeamSize: row.minTeamSize || 1,
          maxTeamSize: row.maxTeamSize || 5,
          prizePool: row.prizePool || '',
          prizeDetails: row.prizeDetails || '',
          workflowNotes: row.workflowNotes || '',
          registrationStartDate: row.registrationStartDate ? new Date(row.registrationStartDate).toISOString().slice(0, 10) : '',
          registrationDeadline: row.registrationDeadline ? new Date(row.registrationDeadline).toISOString().slice(0, 10) : '',
          startDate: row.startDate ? new Date(row.startDate).toISOString().slice(0, 10) : '',
          endDate: row.endDate ? new Date(row.endDate).toISOString().slice(0, 10) : '',
          round1Name: row.rounds?.[0]?.name || 'Round 1',
          round1StartDate: row.rounds?.[0]?.startDate ? new Date(row.rounds[0].startDate).toISOString().slice(0, 10) : '',
          round1EndDate: row.rounds?.[0]?.endDate ? new Date(row.rounds[0].endDate).toISOString().slice(0, 10) : '',
          round2Name: row.rounds?.[1]?.name || 'Round 2',
          round2StartDate: row.rounds?.[1]?.startDate ? new Date(row.rounds[1].startDate).toISOString().slice(0, 10) : '',
          round2EndDate: row.rounds?.[1]?.endDate ? new Date(row.rounds[1].endDate).toISOString().slice(0, 10) : '',
          status: row.status || 'open',
          domains: Array.isArray(row.domains) ? row.domains.join(', ') : ''
        });
        setFormMessage('Editing selected event');
      }
    },
    {
      label: 'Delete',
      variant: 'danger',
      onClick: (row) => openConfirm(
        'Delete Event',
        `Delete event ${row.title}? This cannot be undone.`,
        async () => {
          await DashboardService.adminDeleteEvent(row._id);
          if (editingEventId === row._id) {
            setEditingEventId('');
          }
          await refreshAdminData();
        }
      )
    }
  ];

  const adminColumns = [
    { key: 'title', label: 'Event' },
    { key: 'eventCode', label: 'Event Code' },
    { key: 'status', label: 'Status' },
    { key: 'startDate', label: 'Start', render: (row) => formatDate(row.startDate) },
    { key: 'endDate', label: 'End', render: (row) => formatDate(row.endDate) }
  ];

  const filteredEventRows = useMemo(() => {
    if (eventLifecycleFilter === 'all') return rows;
    const now = new Date();
    return rows.filter((event) => {
      const start = event?.startDate ? new Date(event.startDate) : null;
      const end = event?.endDate ? new Date(event.endDate) : null;
      if (!start || !end) return eventLifecycleFilter === 'all';
      if (eventLifecycleFilter === 'upcoming') return start > now;
      if (eventLifecycleFilter === 'ongoing') return start <= now && end >= now;
      if (eventLifecycleFilter === 'archived') return end < now;
      return true;
    });
  }, [rows, eventLifecycleFilter]);

  if (loading) return <div className="text-sm text-slate-500 dark:text-slate-400">Loading module data...</div>;
  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40">{error}</div>;

  return (
    <div className="space-y-4">
      {notice.text && (
        <div className={`rounded-xl border p-3 text-sm ${notice.type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40'}`}
        >
          {notice.text}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <form onSubmit={onCreateEvent} className="space-y-2 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
          <h2 className="font-semibold dark:text-white">{editingEventId ? 'Update Event' : 'Create Event'}</h2>
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Event Title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Organizer" value={eventForm.organizer} onChange={(e) => setEventForm({ ...eventForm, organizer: e.target.value })} required />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Registration Window</p>
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={eventForm.registrationStartDate} onChange={(e) => setEventForm({ ...eventForm, registrationStartDate: e.target.value })} required />
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={eventForm.registrationDeadline} onChange={(e) => setEventForm({ ...eventForm, registrationDeadline: e.target.value })} required />
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Event Window</p>
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} required />
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} required />
          <input className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Domains (comma separated)" value={eventForm.domains} onChange={(e) => setEventForm({ ...eventForm, domains: e.target.value })} required />
          <button className="w-full rounded-lg bg-brand-700 py-2 text-sm font-semibold text-white">
            {editingEventId ? 'Update Event' : 'Create Event'}
          </button>
          {editingEventId && (
            <button
              type="button"
              className="w-full rounded-lg border border-slate-300 py-2 text-sm font-semibold dark:border-slate-700 dark:text-slate-200"
              onClick={() => {
                setEditingEventId('');
                setEventForm({ title: '', organizer: '', /*...reset form...*/ status: 'open', domains: '' });
                setFormMessage('Edit cancelled');
              }}
            >
              Cancel Edit
            </button>
          )}
          {formMessage && <p className="text-xs text-slate-600 dark:text-slate-300">{formMessage}</p>}
        </form>

        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {['all', 'upcoming', 'ongoing', 'archived'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setEventLifecycleFilter(type)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold ${eventLifecycleFilter === type ? 'bg-brand-700 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'}`}
              >
                {type === 'all' ? 'All Events' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <DataTable
            columns={adminColumns}
            rows={filteredEventRows}
            emptyMessage="No events found"
            rowActions={eventActions}
          />
        </div>
      </div>
      <ConfirmModal
        open={modal.open}
        title={modal.title}
        description={modal.description}
        onCancel={() => setModal({ open: false, title: '', description: '', onConfirm: null })}
        onConfirm={modal.onConfirm || (() => {})}
      />
    </div>
  );
}
