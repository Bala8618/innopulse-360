import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL, withCredentials: true });

// Legacy admin dashboard helpers used by ModulePage layouts.
// These gracefully fall back to empty data if backend endpoints are not present.
export const DashboardService = {
  async adminEvents() {
    try {
      return await api.get('/dashboard/admin/events');
    } catch {
      return { data: { data: [] } };
    }
  },
  async adminCreateEvent(payload) {
    try {
      return await api.post('/dashboard/admin/events', payload);
    } catch {
      return { data: { data: [] } };
    }
  },
  async adminUpdateEvent(id, payload) {
    try {
      return await api.put(`/dashboard/admin/events/${id}`, payload);
    } catch {
      return { data: { data: [] } };
    }
  },
  async adminDeleteEvent(id) {
    try {
      return await api.delete(`/dashboard/admin/events/${id}`);
    } catch {
      return { data: { data: [] } };
    }
  }
};
