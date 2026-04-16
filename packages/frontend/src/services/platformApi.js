import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL, withCredentials: true });

export const PlatformApi = {
  listEvents: (params) => api.get('/platform/events', { params }),
  getEventDetails: (eventId) => api.get(`/platform/events/${eventId}/details`),
  registerEvent: (payload) => api.post('/platform/registrations', payload),
  myRegistrations: (email) => api.get('/platform/registrations/me', { params: { email } }),

  getLogistics: (eventId) => api.get(`/platform/logistics/${eventId}`),
  createRequest: (payload) => api.post('/platform/requests', payload),
  listRequests: (params) => api.get('/platform/requests', { params }),
  updateRequest: (id, payload) => api.put(`/platform/requests/${id}`, payload),

  createReimbursement: (payload) => api.post('/platform/reimbursements', payload),
  listReimbursements: (params) => api.get('/platform/reimbursements', { params }),
  updateReimbursement: (id, payload) => api.put(`/platform/reimbursements/${id}`, payload),

  createOdRequest: (payload) => api.post('/platform/od-requests', payload),
  listOdRequests: (params) => api.get('/platform/od-requests', { params }),
  updateOdRequest: (id, payload) => api.put(`/platform/od-requests/${id}`, payload),

  createReward: (payload) => api.post('/platform/rewards', payload),
  listRewards: (params) => api.get('/platform/rewards', { params }),
  updateReward: (id, payload) => api.put(`/platform/rewards/${id}`, payload),

  feedbackQuestions: () => api.get('/platform/feedback/questions'),
  listFeedbackForms: () => api.get('/platform/feedback/forms'),
  saveFeedbackForm: (payload) => api.post('/platform/feedback/forms', payload),
  listFeedback: () => api.get('/platform/feedback'),
  myFeedback: (email) => api.get('/platform/feedback/me', { params: { email } }),
  submitFeedback: (payload) => api.post('/platform/feedback', payload),
  feedbackAnalytics: () => api.get('/platform/feedback/analytics'),

  createQuery: (payload) => api.post('/platform/queries', payload),
  listQueries: (params) => api.get('/platform/queries', { params }),
  replyQuery: (id, payload) => api.put(`/platform/queries/${id}/reply`, payload),

  adminRaw: (table) => api.get('/platform/admin/raw', { params: { table } }),
  adminUpdate: (table, id, payload) => api.put(`/platform/admin/raw/${table}/${id}`, payload),
  adminDelete: (table, id) => api.delete(`/platform/admin/raw/${table}/${id}`)
};
