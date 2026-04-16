const { getPool } = require('../config/mysql');
const fallbackStore = require('../services/saasFallbackStore');

function asDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function requireFields(payload, fields) {
  const missing = fields.filter((f) => !payload[f]);
  return missing;
}

function shouldUseFallback(error) {
  return ['ECONNREFUSED', 'ENOTFOUND', 'ER_BAD_DB_ERROR', 'ER_NO_SUCH_TABLE', 'ER_ACCESS_DENIED_ERROR'].includes(error?.code);
}

function parseJsonDescription(value) {
  if (!value) return {};
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch (e) {
    return { notes: String(value) };
  }
}

exports.createEvent = async (req, res, next) => {
  try {
    const required = [
      'event_name',
      'description',
      'event_type',
      'start_date',
      'end_date',
      'registration_deadline',
      'organizer',
      'venue',
      'max_participants',
      'prize_details',
      'registration_fee',
      'problem_statement',
      'rules',
      'contact_email',
      'contact_phone'
    ];
    const missing = requireFields(req.body, required);
    if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });

    const pool = getPool();
    let result;
    try {
      const [insertResult] = await pool.execute(
        `INSERT INTO events
        (event_name, description, domain, event_type, event_mode, round_count, team_size_min, team_size_max, registration_start_date, start_date, end_date, registration_deadline, screening_date, judging_date, result_date, organizer, venue, max_participants, prize_details, registration_fee, problem_statement, rules, poster_url, contact_email, contact_phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.event_name,
          req.body.description,
          req.body.domain || null,
          req.body.event_type,
          req.body.event_mode || 'Team',
          Number(req.body.round_count || 1),
          Number(req.body.team_size_min || 1),
          Number(req.body.team_size_max || 5),
          req.body.registration_start_date || null,
          req.body.start_date,
          req.body.end_date,
          req.body.registration_deadline,
          req.body.screening_date || null,
          req.body.judging_date || null,
          req.body.result_date || null,
          req.body.organizer,
          req.body.venue,
          Number(req.body.max_participants),
          req.body.prize_details,
          req.body.registration_fee || null,
          req.body.problem_statement || null,
          req.body.rules,
          req.body.poster_url || null,
          req.body.contact_email,
          req.body.contact_phone,
          req.body.status || 'upcoming'
        ]
      );
      result = insertResult;
    } catch (insertError) {
      if (insertError.code !== 'ER_BAD_FIELD_ERROR') throw insertError;
      const [legacyResult] = await pool.execute(
        `INSERT INTO events
        (event_name, description, event_type, start_date, end_date, registration_deadline, organizer, venue, max_participants, prize_details, rules, poster_url, contact_email, contact_phone, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          req.body.event_name,
          req.body.description,
          req.body.event_type,
          req.body.start_date,
          req.body.end_date,
          req.body.registration_deadline,
          req.body.organizer,
          req.body.venue,
          Number(req.body.max_participants),
          req.body.prize_details,
          req.body.rules,
          req.body.poster_url || null,
          req.body.contact_email,
          req.body.contact_phone,
          req.body.status || 'upcoming'
        ]
      );
      result = legacyResult;
    }
    res.status(201).json({ message: 'Event created', id: result.insertId });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const event = fallbackStore.createEvent(req.body);
      return res.status(201).json({ message: 'Event created (fallback store)', id: event.id });
    }
    next(err);
  }
};

exports.getEvents = async (req, res, next) => {
  try {
    const pool = getPool();
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const search = `%${(req.query.search || '').trim()}%`;
    const status = (req.query.status || '').trim();

    const filterSql = status ? 'AND e.status = ?' : '';
    const filterParams = status ? [search, search, status] : [search, search];

    const [rows] = await pool.execute(
      `SELECT e.*,
        (SELECT COUNT(*) FROM participants p WHERE p.event_id = e.id) AS registrations_count
       FROM events e
       WHERE (e.event_name LIKE ? OR e.organizer LIKE ?)
       ${filterSql}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, limit, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM events e
       WHERE (e.event_name LIKE ? OR e.organizer LIKE ?)
       ${filterSql}`,
      filterParams
    );
    res.json({
      data: rows,
      pagination: { page, limit, total: countRows[0].total }
    });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const page = Math.max(Number(req.query.page || 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
      const data = fallbackStore.listEvents({
        page,
        limit,
        search: req.query.search || '',
        status: req.query.status || ''
      });
      return res.json(data);
    }
    next(err);
  }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const pool = getPool();
    const { id } = req.params;
    const fields = [
      'event_name',
      'description',
      'domain',
      'event_type',
      'event_mode',
      'round_count',
      'team_size_min',
      'team_size_max',
      'registration_start_date',
      'start_date',
      'end_date',
      'registration_deadline',
      'screening_date',
      'judging_date',
      'result_date',
      'organizer',
      'venue',
      'max_participants',
      'prize_details',
      'registration_fee',
      'problem_statement',
      'rules',
      'poster_url',
      'contact_email',
      'contact_phone',
      'status'
    ];

    const updates = [];
    const values = [];
    fields.forEach((f) => {
      if (Object.prototype.hasOwnProperty.call(req.body, f)) {
        updates.push(`${f} = ?`);
        values.push(req.body[f]);
      }
    });
    if (!updates.length) return res.status(422).json({ message: 'No fields to update' });

    values.push(id);
    try {
      await pool.execute(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
    } catch (updateError) {
      if (updateError.code !== 'ER_BAD_FIELD_ERROR') throw updateError;
      const legacyFields = [
        'event_name',
        'description',
        'event_type',
        'start_date',
        'end_date',
        'registration_deadline',
        'organizer',
        'venue',
        'max_participants',
        'prize_details',
        'registration_fee',
        'problem_statement',
        'rules',
        'poster_url',
        'contact_email',
        'contact_phone',
        'status'
      ];
      const legacyUpdates = [];
      const legacyValues = [];
      legacyFields.forEach((f) => {
        if (Object.prototype.hasOwnProperty.call(req.body, f)) {
          legacyUpdates.push(`${f} = ?`);
          legacyValues.push(req.body[f]);
        }
      });
      if (!legacyUpdates.length) return res.status(422).json({ message: 'No valid fields to update for current schema' });
      legacyValues.push(id);
      await pool.execute(`UPDATE events SET ${legacyUpdates.join(', ')} WHERE id = ?`, legacyValues);
    }
    res.json({ message: 'Event updated' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.updateEvent(req.params.id, req.body);
      if (!row) return res.status(404).json({ message: 'Event not found' });
      return res.json({ message: 'Event updated (fallback store)' });
    }
    next(err);
  }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const ok = fallbackStore.deleteEvent(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Event not found' });
      return res.json({ message: 'Event deleted (fallback store)' });
    }
    next(err);
  }
};

exports.createParticipant = async (req, res, next) => {
  try {
    const required = ['student_name', 'college', 'email', 'team_name', 'event_id'];
    const missing = requireFields(req.body, required);
    if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });

    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO participants
      (student_name, college, email, team_name, event_id, registration_date, status, rejection_reason)
      VALUES (?, ?, ?, ?, ?, NOW(), 'pending', NULL)`,
      [req.body.student_name, req.body.college, req.body.email, req.body.team_name, req.body.event_id]
    );
    res.status(201).json({ message: 'Participant registered', id: result.insertId });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.createParticipant(req.body);
      return res.status(201).json({ message: 'Participant registered (fallback store)', id: row.id });
    }
    next(err);
  }
};

exports.getParticipants = async (req, res, next) => {
  try {
    const pool = getPool();
    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
    const offset = (page - 1) * limit;
    const status = (req.query.status || '').trim();
    const search = `%${(req.query.search || '').trim()}%`;

    const filterSql = status ? 'AND p.status = ?' : '';
    const filterParams = status ? [search, search, status] : [search, search];

    const [rows] = await pool.execute(
      `SELECT p.*, e.event_name
       FROM participants p
       JOIN events e ON e.id = p.event_id
       WHERE (p.student_name LIKE ? OR p.email LIKE ?)
       ${filterSql}
       ORDER BY p.registration_date DESC
       LIMIT ? OFFSET ?`,
      [...filterParams, limit, offset]
    );

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total
       FROM participants p
       WHERE (p.student_name LIKE ? OR p.email LIKE ?)
       ${filterSql}`,
      filterParams
    );

    res.json({
      data: rows,
      pagination: { page, limit, total: countRows[0].total }
    });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const page = Math.max(Number(req.query.page || 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit || 10), 1), 100);
      const data = fallbackStore.listParticipants({
        page,
        limit,
        search: req.query.search || '',
        status: req.query.status || ''
      });
      return res.json(data);
    }
    next(err);
  }
};

exports.approveParticipant = async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute(
      `UPDATE participants SET status = 'approved', rejection_reason = NULL WHERE id = ?`,
      [req.params.id]
    );
    res.json({ message: 'Participant approved' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.approveParticipant(req.params.id);
      if (!row) return res.status(404).json({ message: 'Participant not found' });
      return res.json({ message: 'Participant approved (fallback store)' });
    }
    next(err);
  }
};

exports.rejectParticipant = async (req, res, next) => {
  try {
    if (!req.body.reason || !String(req.body.reason).trim()) {
      return res.status(422).json({ message: 'Rejection reason is required' });
    }
    const pool = getPool();
    await pool.execute(
      `UPDATE participants SET status = 'rejected', rejection_reason = ? WHERE id = ?`,
      [String(req.body.reason).trim(), req.params.id]
    );
    res.json({ message: 'Participant rejected' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.rejectParticipant(req.params.id, String(req.body.reason).trim());
      if (!row) return res.status(404).json({ message: 'Participant not found' });
      return res.json({ message: 'Participant rejected (fallback store)' });
    }
    next(err);
  }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const pool = getPool();
    const [cards] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM events) AS total_events,
        (SELECT COUNT(*) FROM participants) AS total_registrations,
        (SELECT COUNT(*) FROM participants WHERE status = 'pending') AS pending_approvals,
        (SELECT COUNT(*) FROM participants WHERE status = 'approved') AS approved_participants,
        (SELECT COUNT(*) FROM events WHERE status = 'active') AS active_events`
    );

    const [eventVsRegistrations] = await pool.query(
      `SELECT e.event_name, COUNT(p.id) AS registrations
       FROM events e
       LEFT JOIN participants p ON p.event_id = e.id
       GROUP BY e.id, e.event_name
       ORDER BY registrations DESC, e.event_name ASC`
    );

    const [approvalSplit] = await pool.query(
      `SELECT status, COUNT(*) AS value
       FROM participants
       GROUP BY status`
    );

    const [dailyGrowth] = await pool.query(
      `SELECT DATE(registration_date) AS day, COUNT(*) AS registrations
       FROM participants
       GROUP BY DATE(registration_date)
       ORDER BY day ASC`
    );

    res.json({
      cards: cards[0],
      charts: { eventVsRegistrations, approvalSplit, dailyGrowth }
    });
  } catch (err) {
    if (shouldUseFallback(err)) {
      return res.json(fallbackStore.getStats());
    }
    next(err);
  }
};

exports.getEventFlow = async (req, res, next) => {
  try {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM events WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Event not found' });
    const event = rows[0];

    const regOpen = asDate(event.registration_start_date || event.created_at);
    const regClose = asDate(event.registration_deadline);
    const start = asDate(event.start_date);
    const end = asDate(event.end_date);
    const screening = asDate(event.screening_date || event.registration_deadline);
    const judging = asDate(event.judging_date || event.end_date);
    const result = asDate(event.result_date || event.end_date);

    const flow = [
      { id: '1', label: 'Event Created', date: regOpen },
      { id: '2', label: 'Registration Open', date: regOpen },
      { id: '3', label: 'Registration Closed', date: regClose },
      { id: '4', label: 'Participant Screening', date: screening },
      { id: '5', label: 'Approved Participants', date: screening },
      { id: '6', label: 'Event Start', date: start },
      { id: '7', label: 'Project Submission', date: start },
      { id: '8', label: 'Judging', date: judging },
      { id: '9', label: 'Winner Announcement', date: result || end }
    ];

    res.json({ event, flow });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const payload = fallbackStore.getFlow(req.params.id);
      if (!payload) return res.status(404).json({ message: 'Event not found' });
      return res.json(payload);
    }
    next(err);
  }
};

exports.getEventManagementByEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const pool = getPool();
    const [[event]] = await pool.execute('SELECT * FROM events WHERE id = ?', [eventId]);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const [modulesRaw] = await pool.execute(
      'SELECT * FROM event_management WHERE event_id = ? ORDER BY updated_at DESC',
      [eventId]
    );
    const modules = modulesRaw.map((m) => ({ ...m, description: parseJsonDescription(m.description) }));

    const [[participantCount]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM participants WHERE event_id = ?',
      [eventId]
    );

    const byCategory = {};
    modules.forEach((m) => { if (!byCategory[m.category]) byCategory[m.category] = m; });
    const accommodation = byCategory.accommodation?.description || {};
    const food = byCategory.food?.description || {};
    const travel = byCategory.travel?.description || {};
    const registration = byCategory.registration?.description || {};

    const rooms = Number(accommodation.total_rooms_available || 0);
    const perRoom = Number(accommodation.participants_per_room || 0);

    res.json({
      event,
      modules,
      summary: {
        total_registered_participants: participantCount.total,
        accommodation_capacity: rooms * perRoom,
        food_arrangements_status: food.food_provided ? 'Configured' : 'Pending',
        travel_support_status: travel.travel_support_available ? 'Configured' : 'Pending',
        registration_fee_collection_status: registration.registration_fee_required ? 'Fee Required' : 'Free / Not Configured'
      }
    });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const payload = fallbackStore.getEventManagementByEvent(req.params.event_id);
      if (!payload) return res.status(404).json({ message: 'Event not found' });
      return res.json(payload);
    }
    next(err);
  }
};

exports.createEventManagement = async (req, res, next) => {
  try {
    const required = ['event_id', 'category'];
    const missing = requireFields(req.body, required);
    if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });

    const pool = getPool();
    const [result] = await pool.execute(
      `INSERT INTO event_management
      (event_id, category, description, cost_applicable, cost_amount, reimbursement_code, payment_qr, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        Number(req.body.event_id),
        req.body.category,
        JSON.stringify(req.body.description || {}),
        !!req.body.cost_applicable,
        Number(req.body.cost_amount || 0),
        req.body.reimbursement_code || null,
        req.body.payment_qr || null
      ]
    );
    res.status(201).json({ message: 'Event management configuration saved', id: result.insertId });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.createEventManagement(req.body);
      return res.status(201).json({ message: 'Event management configuration saved (fallback store)', id: row.id });
    }
    next(err);
  }
};

exports.updateEventManagement = async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute(
      `UPDATE event_management
       SET category = COALESCE(?, category),
           description = COALESCE(?, description),
           cost_applicable = COALESCE(?, cost_applicable),
           cost_amount = COALESCE(?, cost_amount),
           reimbursement_code = COALESCE(?, reimbursement_code),
           payment_qr = COALESCE(?, payment_qr),
           updated_at = NOW()
       WHERE id = ?`,
      [
        req.body.category ?? null,
        typeof req.body.description === 'undefined' ? null : JSON.stringify(req.body.description || {}),
        typeof req.body.cost_applicable === 'undefined' ? null : !!req.body.cost_applicable,
        typeof req.body.cost_amount === 'undefined' ? null : Number(req.body.cost_amount || 0),
        req.body.reimbursement_code ?? null,
        req.body.payment_qr ?? null,
        Number(req.params.id)
      ]
    );
    res.json({ message: 'Event management configuration updated' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const row = fallbackStore.updateEventManagement(req.params.id, req.body);
      if (!row) return res.status(404).json({ message: 'Configuration not found' });
      return res.json({ message: 'Event management configuration updated (fallback store)' });
    }
    next(err);
  }
};

exports.deleteEventManagement = async (req, res, next) => {
  try {
    const pool = getPool();
    await pool.execute('DELETE FROM event_management WHERE id = ?', [Number(req.params.id)]);
    res.json({ message: 'Event management configuration deleted' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      const ok = fallbackStore.deleteEventManagement(req.params.id);
      if (!ok) return res.status(404).json({ message: 'Configuration not found' });
      return res.json({ message: 'Event management configuration deleted (fallback store)' });
    }
    next(err);
  }
};

exports.getEventBudget = async (req, res, next) => {
  try {
    const eventId = Number(req.params.event_id);
    const pool = getPool();
    const [rows] = await pool.execute('SELECT * FROM event_budget WHERE event_id = ? ORDER BY updated_at DESC LIMIT 1', [eventId]);
    if (!rows.length) {
      return res.json({
        id: null,
        event_id: eventId,
        accommodation_cost: 0,
        food_cost: 0,
        travel_cost: 0,
        registration_revenue: 0,
        total_budget: 0
      });
    }
    res.json(rows[0]);
  } catch (err) {
    if (shouldUseFallback(err)) {
      const payload = fallbackStore.getBudgetByEvent(req.params.event_id);
      if (!payload) return res.status(404).json({ message: 'Event not found' });
      return res.json(payload);
    }
    next(err);
  }
};

exports.upsertEventBudget = async (req, res, next) => {
  try {
    const required = ['event_id'];
    const missing = requireFields(req.body, required);
    if (missing.length) return res.status(422).json({ message: `Missing fields: ${missing.join(', ')}` });

    const eventId = Number(req.body.event_id);
    const payload = {
      accommodation_cost: Number(req.body.accommodation_cost || 0),
      food_cost: Number(req.body.food_cost || 0),
      travel_cost: Number(req.body.travel_cost || 0),
      registration_revenue: Number(req.body.registration_revenue || 0),
      total_budget: Number(req.body.total_budget || 0)
    };

    const pool = getPool();
    await pool.execute(
      `INSERT INTO event_budget
      (event_id, accommodation_cost, food_cost, travel_cost, registration_revenue, total_budget, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
      accommodation_cost = VALUES(accommodation_cost),
      food_cost = VALUES(food_cost),
      travel_cost = VALUES(travel_cost),
      registration_revenue = VALUES(registration_revenue),
      total_budget = VALUES(total_budget),
      updated_at = NOW()`,
      [eventId, payload.accommodation_cost, payload.food_cost, payload.travel_cost, payload.registration_revenue, payload.total_budget]
    );
    res.status(201).json({ message: 'Budget saved' });
  } catch (err) {
    if (shouldUseFallback(err)) {
      fallbackStore.upsertBudget(req.body);
      return res.status(201).json({ message: 'Budget saved (fallback store)' });
    }
    next(err);
  }
};
