import { useState } from 'react';
import { SaasApi } from '../../services/saasApi';

const initial = {
  event_name: '',
  description: '',
  domain: '',
  event_type: 'Online',
  event_mode: 'Team',
  round_count: 1,
  team_size_min: 1,
  team_size_max: 5,
  registration_start_date: '',
  start_date: '',
  end_date: '',
  registration_deadline: '',
  screening_date: '',
  judging_date: '',
  result_date: '',
  organizer: '',
  venue: '',
  max_participants: '',
  prize_details: '',
  registration_fee: '',
  fee_enabled: false,
  fee_amount: '',
  fee_instructions: '',
  food_enabled: false,
  food_type: 'Veg',
  meal_options: [],
  accommodation_enabled: false,
  accommodation_type: 'Hostel',
  accommodation_days: '',
  accommodation_capacity: '',
  travel_enabled: false,
  travel_mode: 'Bus',
  travel_reimbursement_limit: '',
  problem_statement: '',
  rules: '',
  poster_url: '',
  contact_email: '',
  contact_phone: '',
  status: 'upcoming'
};

export default function EventCreationPage() {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await SaasApi.createEvent(form);
      setToast('Event created successfully.');
      setForm(initial);
    } catch (err) {
      setToast(err?.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
      setTimeout(() => setToast(''), 3000);
    }
  };

  const toggleMeal = (meal) => {
    setForm((prev) => {
      const list = prev.meal_options.includes(meal)
        ? prev.meal_options.filter((m) => m !== meal)
        : [...prev.meal_options, meal];
      return { ...prev, meal_options: list };
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Event Creation</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">Create an event with complete operational details and clearly labeled timeline dates.</p>
        {toast && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{toast}</p>}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Event Basic Details</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Event Name" value={form.event_name} onChange={(e) => setForm({ ...form, event_name: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Domain (AI, IoT, FinTech...)" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Organizer Name" value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} required />
        <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={form.event_type} onChange={(e) => setForm({ ...form, event_type: e.target.value })}>
          <option>Online</option>
          <option>Offline</option>
          <option>Hybrid</option>
        </select>
        <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={form.event_mode} onChange={(e) => setForm({ ...form, event_mode: e.target.value })}>
          <option value="Individual">Individual</option>
          <option value="Team">Team</option>
        </select>
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Venue / Platform" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="number" min="1" placeholder="Rounds Count" value={form.round_count} onChange={(e) => setForm({ ...form, round_count: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="number" min="1" placeholder="Min Team Size" value={form.team_size_min} onChange={(e) => setForm({ ...form, team_size_min: e.target.value })} />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="number" min="1" placeholder="Max Team Size" value={form.team_size_max} onChange={(e) => setForm({ ...form, team_size_max: e.target.value })} />
          </div>
          <div className="mt-3">
            <textarea className="w-full rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" rows={3} placeholder="Event Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Event Timeline</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Registration Start Date & Time
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.registration_start_date} onChange={(e) => setForm({ ...form, registration_start_date: e.target.value })} required />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Registration End Date (Deadline)
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.registration_deadline} onChange={(e) => setForm({ ...form, registration_deadline: e.target.value })} required />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Event Start Date & Time
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Event End Date & Time
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Screening Date
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.screening_date} onChange={(e) => setForm({ ...form, screening_date: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Judging Date
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.judging_date} onChange={(e) => setForm({ ...form, judging_date: e.target.value })} />
        </label>
        <label className="space-y-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          Result Announcement Date
          <input className="w-full rounded-lg border p-2 text-sm font-normal dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="datetime-local" value={form.result_date} onChange={(e) => setForm({ ...form, result_date: e.target.value })} />
        </label>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Resource Configuration</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.fee_enabled} onChange={(e) => setForm({ ...form, fee_enabled: e.target.checked })} />
              Registration Fee Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.food_enabled} onChange={(e) => setForm({ ...form, food_enabled: e.target.checked })} />
              Food Provided
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.accommodation_enabled} onChange={(e) => setForm({ ...form, accommodation_enabled: e.target.checked })} />
              Accommodation Available
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.travel_enabled} onChange={(e) => setForm({ ...form, travel_enabled: e.target.checked })} />
              Travel Support
            </label>
          </div>

          {form.fee_enabled && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input className="rounded-lg border p-2" placeholder="Fee Amount" value={form.fee_amount} onChange={(e) => setForm({ ...form, fee_amount: e.target.value })} />
              <input className="rounded-lg border p-2" placeholder="Payment Instructions" value={form.fee_instructions} onChange={(e) => setForm({ ...form, fee_instructions: e.target.value })} />
            </div>
          )}

          {form.food_enabled && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select className="rounded-lg border p-2" value={form.food_type} onChange={(e) => setForm({ ...form, food_type: e.target.value })}>
                <option>Veg</option>
                <option>Non-Veg</option>
                <option>Both</option>
              </select>
              <div className="flex flex-wrap gap-3 text-sm">
                {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => (
                  <label key={m} className="flex items-center gap-2">
                    <input type="checkbox" checked={form.meal_options.includes(m)} onChange={() => toggleMeal(m)} />
                    {m}
                  </label>
                ))}
              </div>
            </div>
          )}

          {form.accommodation_enabled && (
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <select className="rounded-lg border p-2" value={form.accommodation_type} onChange={(e) => setForm({ ...form, accommodation_type: e.target.value })}>
                <option>Hostel</option>
                <option>Hotel</option>
                <option>Guest House</option>
              </select>
              <input className="rounded-lg border p-2" placeholder="Days" value={form.accommodation_days} onChange={(e) => setForm({ ...form, accommodation_days: e.target.value })} />
              <input className="rounded-lg border p-2" placeholder="Room Capacity" value={form.accommodation_capacity} onChange={(e) => setForm({ ...form, accommodation_capacity: e.target.value })} />
            </div>
          )}

          {form.travel_enabled && (
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <select className="rounded-lg border p-2" value={form.travel_mode} onChange={(e) => setForm({ ...form, travel_mode: e.target.value })}>
                <option>Bus</option>
                <option>Train</option>
                <option>Flight</option>
              </select>
              <input className="rounded-lg border p-2" placeholder="Reimbursement Limit" value={form.travel_reimbursement_limit} onChange={(e) => setForm({ ...form, travel_reimbursement_limit: e.target.value })} />
            </div>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Other Details</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="number" placeholder="Maximum Participants" value={form.max_participants} onChange={(e) => setForm({ ...form, max_participants: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Registration Fee (e.g., Free / 500 INR)" value={form.registration_fee} onChange={(e) => setForm({ ...form, registration_fee: e.target.value })} />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" type="email" placeholder="Contact Email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
        <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Contact Phone" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} required />
        <input className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Upload Poster URL" value={form.poster_url} onChange={(e) => setForm({ ...form, poster_url: e.target.value })} />
        <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" rows={3} placeholder="Problem Statement / Challenge Heading" value={form.problem_statement} onChange={(e) => setForm({ ...form, problem_statement: e.target.value })} />
        <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" rows={3} placeholder="Prize Details" value={form.prize_details} onChange={(e) => setForm({ ...form, prize_details: e.target.value })} required />
        <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" rows={3} placeholder="Rules & Guidelines" value={form.rules} onChange={(e) => setForm({ ...form, rules: e.target.value })} required />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button disabled={loading} className="rounded-lg bg-blue-700 px-5 py-2 font-semibold text-white disabled:opacity-60">
            {loading ? 'Saving...' : 'Create Event'}
          </button>
        </div>
      </form>
    </div>
  );
}
