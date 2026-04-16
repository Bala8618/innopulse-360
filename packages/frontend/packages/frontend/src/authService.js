import api from './api';

export const AuthService = {
  register: (payload) => api.post('/auth/register', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  login: (payload) => api.post('/auth/login', payload),
  forgotPassword: (payload) => api.post('/auth/forgot-password', payload),
  resetPassword: (token, payload) => api.post(`/auth/reset-password/${token}`, payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};
