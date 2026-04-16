import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL, withCredentials: true });

export const SaasApi = {
  dashboardStats: () => api.get('/dashboard/stats'),

  createEvent: (payload) => api.post('/events', payload),
  getEvents: (params) => api.get('/events', { params }),
  updateEvent: (id, payload) => api.put(`/events/${id}`, payload),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  getEventFlow: (id) => api.get(`/events/${id}/flow`),

  createParticipant: (payload) => api.post('/participants', payload),
  getParticipants: (params) => api.get('/participants', { params }),
  approveParticipant: (id) => api.put(`/participants/${id}/approve`),
  rejectParticipant: (id, payload) => api.put(`/participants/${id}/reject`, payload),

  getEventManagement: (eventId) => api.get(`/event-management/${eventId}`),
  createEventManagement: (payload) => api.post('/event-management', payload),
  updateEventManagement: (id, payload) => api.put(`/event-management/${id}`, payload),
  deleteEventManagement: (id) => api.delete(`/event-management/${id}`),

  getEventBudget: (eventId) => api.get(`/event-budget/${eventId}`),
  saveEventBudget: (payload) => api.post('/event-budget', payload)
};
