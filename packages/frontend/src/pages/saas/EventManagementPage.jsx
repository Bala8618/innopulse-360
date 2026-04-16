import { useEffect, useMemo, useState } from 'react';
import { FiCalendar, FiCoffee, FiCreditCard, FiDollarSign, FiHome, FiMapPin, FiSearch, FiTruck } from 'react-icons/fi';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ReactFlow, { Background, Controls, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import { Link } from 'react-router-dom';
import { SaasApi } from '../../services/saasApi';

const moduleCards = [
  { key: 'accommodation', title: 'Accommodation Planning', icon: FiHome, color: 'from-indigo-500 to-blue-500' },
  { key: 'food', title: 'Food & Catering Planning', icon: FiCoffee, color: 'from-emerald-500 to-green-500' },
  { key: 'travel', title: 'Travel & Transportation Planning', icon: FiTruck, color: 'from-amber-500 to-orange-500' },
  { key: 'registration', title: 'Registration Fees & Payments', icon: FiCreditCard, color: 'from-pink-500 to-rose-500' },
  { key: 'budget', title: 'Event Budget Overview', icon: FiDollarSign, color: 'from-cyan-500 to-sky-500' },
  { key: 'timeline', title: 'Event Timeline Planner', icon: FiCalendar, color: 'from-violet-500 to-purple-500' }
];

const yesNo = [{ value: true, label: 'Yes' }, { value: false, label: 'No' }];

const initialForm = {
  accommodation: {
    accommodation_required: true,
    accommodation_type: 'Hostel',
    accommodation_location: '',
    total_rooms_available: '',
    participants_per_room: '',
    check_in_date: '',
    check_out_date: '',
    cost_applicable: false,
    accommodation_cost: '',
    reimbursement_code: '',
    payment_instructions: ''
  },
  food: {
    food_provided: true,
    meal_types: ['Breakfast', 'Lunch'],
    catering_vendor: '',
    estimated_number_of_meals: '',
    cost_applicable: false,
    meal_cost: '',
    reimbursement_code: '',
    payment_details: ''
  },
  travel: {
    travel_support_available: true,
    pickup_locations: '',
    drop_locations: '',
    transportation_type: 'Bus',
    travel_schedule: '',
    cost_applicable: false,
    travel_cost: '',
    reimbursement_code: '',
    travel_payment_instructions: ''
  },
  registration: {
    registration_fee_required: true,
    fee_amount: '',
    payment_deadline: '',
    payment_methods: ['UPI'],
    payment_details: '',
    payment_qr: ''
  }
};

function statCard(title, value, hint, color) {
  return { title, value, hint, color };
}

function timelineNodes(eventData) {
  const points = [
    { id: '1', label: 'Event Preparation', date: eventData?.created_at },
    { id: '2', label: 'Registration Open', date: eventData?.registration_start_date },
    { id: '3', label: 'Registration Closed', date: eventData?.registration_deadline },
    { id: '4', label: 'Participant Approval', date: eventData?.screening_date },
    { id: '5', label: 'Hackathon Start', date: eventData?.start_date },
    { id: '6', label: 'Project Submission', date: eventData?.start_date },
    { id: '7', label: 'Judging Phase', date: eventData?.judging_date },
    { id: '8', label: 'Winner Announcement', date: eventData?.result_date || eventData?.end_date }
  ];

  const nodes = points.map((p, i) => ({
    id: p.id,
    position: { x: i % 2 ? 420 : 60, y: i * 95 },
    data: { label: `${p.label}\n${p.date ? new Date(p.date).toLocaleDateString() : '-'}` },
    style: {
      borderRadius: 12,
      border: '1px solid #c7d2fe',
      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      color: '#fff',
      fontWeight: 600,
      width: 270,
      padding: 10
    }
  }));
  const edges = points.slice(1).map((p, i) => ({
    id: `e${i}`,
    source: points[i].id,
    target: p.id,
    type: 'smoothstep',
    animated: true,
    markerEnd: { type: MarkerType.ArrowClosed },
    style: { stroke: '#6366f1', strokeWidth: 2.2 }
  }));
  return { nodes, edges };
}

function buildQrUrl(text) {
  const payload = encodeURIComponent(text || 'InnoPulse 360 Payment');
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${payload}`;
}

export default function EventManagementPage() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [eventPayload, setEventPayload] = useState(null);
  const [activeModule, setActiveModule] = useState('accommodation');
  const [forms, setForms] = useState(initialForm);
  const [moduleMap, setModuleMap] = useState({});
  const [budget, setBudget] = useState({
    accommodation_cost: 0, food_cost: 0, travel_cost: 0, registration_revenue: 0, total_budget: 0
  });
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    SaasApi.getEvents({ page: 1, limit: 200 }).then((res) => {
      const rows = res.data?.data || [];
      setEvents(rows);
      if (!selectedEventId && rows.length) setSelectedEventId(String(rows[0].id));
    });
  }, []);

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return events;
    return events.filter((e) => e.event_name.toLowerCase().includes(q));
  }, [events, search]);

  const selectedEvent = useMemo(() => events.find((e) => String(e.id) === String(selectedEventId)), [events, selectedEventId]);

  const loadEventManagement = async (eventId) => {
    try {
      const [mgmtRes, budgetRes] = await Promise.all([SaasApi.getEventManagement(eventId), SaasApi.getEventBudget(eventId)]);
      setEventPayload(mgmtRes.data);
      const map = {};
      (mgmtRes.data?.modules || []).forEach((m) => { map[m.category] = m; });
      setModuleMap(map);
      setBudget({
        accommodation_cost: Number(budgetRes.data?.accommodation_cost || 0),
        food_cost: Number(budgetRes.data?.food_cost || 0),
        travel_cost: Number(budgetRes.data?.travel_cost || 0),
        registration_revenue: Number(budgetRes.data?.registration_revenue || 0),
        total_budget: Number(budgetRes.data?.total_budget || 0)
      });

      const nextForms = { ...initialForm };
      ['accommodation', 'food', 'travel', 'registration'].forEach((k) => {
        if (map[k]?.description) nextForms[k] = { ...nextForms[k], ...map[k].description };
      });
      setForms(nextForms);
      setError('');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load event management details.');
    }
  };

  useEffect(() => {
    if (!selectedEventId) return;
    loadEventManagement(selectedEventId);
  }, [selectedEventId]);

  const summaryCards = useMemo(() => {
    const s = eventPayload?.summary || {};
    return [
      statCard('Total Registered Participants', s.total_registered_participants || 0, 'Live registrations', 'bg-blue-100 text-blue-700'),
      statCard('Accommodation Capacity', s.accommodation_capacity || 0, 'Rooms × participants/room', 'bg-violet-100 text-violet-700'),
      statCard('Food Arrangements', s.food_arrangements_status || 'Pending', 'Catering readiness', 'bg-emerald-100 text-emerald-700'),
      statCard('Travel Support', s.travel_support_status || 'Pending', 'Transport planning', 'bg-amber-100 text-amber-700'),
      statCard('Fee Collection', s.registration_fee_collection_status || 'Pending', 'Payment status', 'bg-rose-100 text-rose-700')
    ];
  }, [eventPayload]);

  const onSaveModule = async (category) => {
    if (!selectedEventId) return;
    const data = forms[category];
    const payload = {
      event_id: Number(selectedEventId),
      category,
      description: data,
      cost_applicable: !!data.cost_applicable,
      cost_amount: Number(data.accommodation_cost || data.meal_cost || data.travel_cost || data.fee_amount || 0),
      reimbursement_code: data.reimbursement_code || null,
      payment_qr: data.payment_qr || null
    };
    try {
      if (moduleMap[category]?.id) {
        await SaasApi.updateEventManagement(moduleMap[category].id, payload);
      } else {
        await SaasApi.createEventManagement(payload);
      }
      setToast(`${category} configuration saved.`);
      loadEventManagement(selectedEventId);
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to save ${category}.`);
    } finally {
      setTimeout(() => setToast(''), 2500);
    }
  };

  const onSaveBudget = async () => {
    try {
      await SaasApi.saveEventBudget({
        event_id: Number(selectedEventId),
        ...budget
      });
      setToast('Budget saved.');
      setTimeout(() => setToast(''), 2500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save budget.');
    }
  };

  const budgetChartData = [
    { name: 'Accommodation', value: Number(budget.accommodation_cost || 0) },
    { name: 'Food', value: Number(budget.food_cost || 0) },
    { name: 'Travel', value: Number(budget.travel_cost || 0) },
    { name: 'Revenue', value: Number(budget.registration_revenue || 0) }
  ];

  const budgetPieData = [
    { name: 'Operations Cost', value: Number(budget.accommodation_cost || 0) + Number(budget.food_cost || 0) + Number(budget.travel_cost || 0) },
    { name: 'Registration Revenue', value: Number(budget.registration_revenue || 0) }
  ];

  const timelineGraph = useMemo(() => timelineNodes(eventPayload?.event), [eventPayload]);

  const renderModuleForm = () => {
    const update = (category, key, value) => setForms((prev) => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
    const updateMealTypes = (value) => {
      const old = forms.food.meal_types || [];
      const next = old.includes(value) ? old.filter((x) => x !== value) : [...old, value];
      update('food', 'meal_types', next);
    };
    const updatePaymentMethods = (value) => {
      const old = forms.registration.payment_methods || [];
      const next = old.includes(value) ? old.filter((x) => x !== value) : [...old, value];
      update('registration', 'payment_methods', next);
    };

    if (activeModule === 'accommodation') {
      const f = forms.accommodation;
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.accommodation_required)} onChange={(e) => update('accommodation', 'accommodation_required', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Accommodation Required: ${x.label}`}</option>)}</select>
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={f.accommodation_type} onChange={(e) => update('accommodation', 'accommodation_type', e.target.value)}>{['Hostel', 'Hotel', 'Guest House'].map((x) => <option key={x}>{x}</option>)}</select>
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Accommodation Location" value={f.accommodation_location} onChange={(e) => update('accommodation', 'accommodation_location', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Total Rooms Available" value={f.total_rooms_available} onChange={(e) => update('accommodation', 'total_rooms_available', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Participants per Room" value={f.participants_per_room} onChange={(e) => update('accommodation', 'participants_per_room', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={f.check_in_date} onChange={(e) => update('accommodation', 'check_in_date', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" value={f.check_out_date} onChange={(e) => update('accommodation', 'check_out_date', e.target.value)} />
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.cost_applicable)} onChange={(e) => update('accommodation', 'cost_applicable', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Cost Applicable: ${x.label}`}</option>)}</select>
          {f.cost_applicable && (
            <>
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Accommodation Cost" value={f.accommodation_cost} onChange={(e) => update('accommodation', 'accommodation_cost', e.target.value)} />
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="College Reimbursement Code" value={f.reimbursement_code} onChange={(e) => update('accommodation', 'reimbursement_code', e.target.value)} />
              <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Payment Instructions" value={f.payment_instructions} onChange={(e) => update('accommodation', 'payment_instructions', e.target.value)} />
            </>
          )}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2" onClick={() => onSaveModule('accommodation')}>Save Accommodation Plan</button>
        </div>
      );
    }

    if (activeModule === 'food') {
      const f = forms.food;
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.food_provided)} onChange={(e) => update('food', 'food_provided', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Food Provided: ${x.label}`}</option>)}</select>
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Catering Vendor" value={f.catering_vendor} onChange={(e) => update('food', 'catering_vendor', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Estimated Number of Meals" value={f.estimated_number_of_meals} onChange={(e) => update('food', 'estimated_number_of_meals', e.target.value)} />
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.cost_applicable)} onChange={(e) => update('food', 'cost_applicable', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Cost Applicable: ${x.label}`}</option>)}</select>
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-lg border px-2 py-1 text-sm dark:border-slate-700">
                <input type="checkbox" checked={(f.meal_types || []).includes(m)} onChange={() => updateMealTypes(m)} />
                {m}
              </label>
            ))}
          </div>
          {f.cost_applicable && (
            <>
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Meal Cost" value={f.meal_cost} onChange={(e) => update('food', 'meal_cost', e.target.value)} />
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Reimbursement Code" value={f.reimbursement_code} onChange={(e) => update('food', 'reimbursement_code', e.target.value)} />
              <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Payment Details" value={f.payment_details} onChange={(e) => update('food', 'payment_details', e.target.value)} />
            </>
          )}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2" onClick={() => onSaveModule('food')}>Save Food Plan</button>
        </div>
      );
    }

    if (activeModule === 'travel') {
      const f = forms.travel;
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.travel_support_available)} onChange={(e) => update('travel', 'travel_support_available', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Travel Support: ${x.label}`}</option>)}</select>
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={f.transportation_type} onChange={(e) => update('travel', 'transportation_type', e.target.value)}>{['Bus', 'Cab', 'Shuttle'].map((x) => <option key={x}>{x}</option>)}</select>
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Pickup Locations" value={f.pickup_locations} onChange={(e) => update('travel', 'pickup_locations', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Drop Locations" value={f.drop_locations} onChange={(e) => update('travel', 'drop_locations', e.target.value)} />
          <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Travel Schedule" value={f.travel_schedule} onChange={(e) => update('travel', 'travel_schedule', e.target.value)} />
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.cost_applicable)} onChange={(e) => update('travel', 'cost_applicable', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Cost Applicable: ${x.label}`}</option>)}</select>
          {f.cost_applicable && (
            <>
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Travel Cost" value={f.travel_cost} onChange={(e) => update('travel', 'travel_cost', e.target.value)} />
              <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="Reimbursement Code" value={f.reimbursement_code} onChange={(e) => update('travel', 'reimbursement_code', e.target.value)} />
              <textarea className="rounded-lg border p-2 md:col-span-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Travel Payment Instructions" value={f.travel_payment_instructions} onChange={(e) => update('travel', 'travel_payment_instructions', e.target.value)} />
            </>
          )}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2" onClick={() => onSaveModule('travel')}>Save Travel Plan</button>
        </div>
      );
    }

    if (activeModule === 'registration') {
      const f = forms.registration;
      return (
        <div className="grid gap-2 md:grid-cols-2">
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" value={String(f.registration_fee_required)} onChange={(e) => update('registration', 'registration_fee_required', e.target.value === 'true')}>{yesNo.map((x) => <option key={x.label} value={String(x.value)}>{`Registration Fee Required: ${x.label}`}</option>)}</select>
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Fee Amount" value={f.fee_amount} onChange={(e) => update('registration', 'fee_amount', e.target.value)} />
          <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="date" placeholder="Payment Deadline" value={f.payment_deadline} onChange={(e) => update('registration', 'payment_deadline', e.target.value)} />
          <textarea className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" rows={2} placeholder="Payment Details" value={f.payment_details} onChange={(e) => update('registration', 'payment_details', e.target.value)} />
          <div className="md:col-span-2 flex flex-wrap gap-2">
            {['UPI', 'QR Code', 'Bank Transfer'].map((m) => (
              <label key={m} className="flex items-center gap-2 rounded-lg border px-2 py-1 text-sm dark:border-slate-700">
                <input type="checkbox" checked={(f.payment_methods || []).includes(m)} onChange={() => updatePaymentMethods(m)} />
                {m}
              </label>
            ))}
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-2">
            <input className="flex-1 rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" placeholder="QR URL (optional)" value={f.payment_qr} onChange={(e) => update('registration', 'payment_qr', e.target.value)} />
            <button className="rounded-lg border px-3 py-2 dark:border-slate-700" onClick={() => update('registration', 'payment_qr', buildQrUrl(f.payment_details || `Event:${selectedEvent?.event_name}`))}>Generate QR</button>
          </div>
          {f.payment_qr && <img src={f.payment_qr} alt="payment-qr" className="h-36 w-36 rounded-lg border p-1 md:col-span-2" />}
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white md:col-span-2" onClick={() => onSaveModule('registration')}>Save Registration Payment Plan</button>
        </div>
      );
    }

    if (activeModule === 'budget') {
      return (
        <div className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Accommodation Cost" value={budget.accommodation_cost} onChange={(e) => setBudget({ ...budget, accommodation_cost: e.target.value })} />
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Food Cost" value={budget.food_cost} onChange={(e) => setBudget({ ...budget, food_cost: e.target.value })} />
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Travel Cost" value={budget.travel_cost} onChange={(e) => setBudget({ ...budget, travel_cost: e.target.value })} />
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800" type="number" placeholder="Expected Registration Revenue" value={budget.registration_revenue} onChange={(e) => setBudget({ ...budget, registration_revenue: e.target.value })} />
            <input className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 md:col-span-2" type="number" placeholder="Total Event Budget" value={budget.total_budget} onChange={(e) => setBudget({ ...budget, total_budget: e.target.value })} />
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white" onClick={onSaveBudget}>Save Budget</button>
          <div className="grid gap-4 xl:grid-cols-2">
            <div className="h-72 rounded-xl border p-2 dark:border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={budgetChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-72 rounded-xl border p-2 dark:border-slate-700">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={budgetPieData} dataKey="value" outerRadius={90} label>
                    <Cell fill="#f97316" />
                    <Cell fill="#16a34a" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="h-[62vh] rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/60">
        <ReactFlow nodes={timelineGraph.nodes} edges={timelineGraph.edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-xl font-semibold dark:text-white">Event Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-300">Search event by name, validate event ID, and configure operational logistics.</p>
        {toast && <p className="mt-2 rounded bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">{toast}</p>}
        {error && <p className="mt-2 rounded bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-900/30 dark:text-rose-200">{error}</p>}
        <div className="mt-3 grid gap-2 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-slate-400" />
            <input className="w-full rounded-lg border p-2 pl-10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" placeholder="Search event name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="rounded-lg border p-2 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" value={selectedEventId} onChange={(e) => setSelectedEventId(e.target.value)}>
            <option value="">Select Event</option>
            {filteredEvents.map((e) => <option key={e.id} value={e.id}>{e.event_name}</option>)}
          </select>
        </div>
        <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
          Event ID: <span className="font-semibold">{selectedEvent?.id || '-'}</span>
          {!filteredEvents.length && (
            <span className="ml-3">
              Event not found. <Link to="/saas/event-creation" className="font-semibold text-blue-600 underline">Create Event</Link>
            </span>
          )}
        </div>
      </section>

      {selectedEventId && (
        <>
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {summaryCards.map((c) => (
              <article key={c.title} className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{c.title}</p>
                <p className={`mt-2 inline-flex rounded px-2 py-1 text-lg font-bold ${c.color}`}>{c.value}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.hint}</p>
              </article>
            ))}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-semibold dark:text-white">Event Logistics Planning Menu</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {moduleCards.map((m) => {
                const Icon = m.icon;
                return (
                  <button key={m.key} onClick={() => setActiveModule(m.key)} className={`rounded-xl border p-3 text-left transition ${activeModule === m.key ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/30' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800'}`}>
                    <div className={`inline-flex rounded-lg bg-gradient-to-r p-2 text-white ${m.color}`}><Icon /></div>
                    <p className="mt-2 font-semibold dark:text-white">{m.title}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-3 text-lg font-semibold capitalize dark:text-white">{activeModule.replace('-', ' ')}</h3>
            {renderModuleForm()}
          </section>
        </>
      )}
    </div>
  );
}
