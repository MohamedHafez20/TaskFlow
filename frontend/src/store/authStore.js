import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
  user:    JSON.parse(localStorage.getItem('user')) || null,
  token:   localStorage.getItem('token') || null,
  loading: false,
  error:   null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  register: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      set({ user: data, token: data.token, loading: false });
      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
