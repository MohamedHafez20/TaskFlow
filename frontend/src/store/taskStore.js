import { create } from 'zustand';
import api from '../api/axios';

const useTaskStore = create((set) => ({
  tasks:   [],
  stats:   { total: 0, done: 0, inProgress: 0, todo: 0 },
  loading: false,
  error:   null,

  fetchTasks: async (filters = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tasks', { params: filters });
      set({ tasks: data, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message, loading: false });
    }
  },

  fetchStats: async () => {
    try {
      const { data } = await api.get('/tasks/stats');
      set({ stats: data });
    } catch (err) {
      console.error(err);
    }
  },

  createTask: async (taskData) => {
    try {
      const { data } = await api.post('/tasks', taskData);
      set((s) => ({ tasks: [data, ...s.tasks] }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, updates);
      set((s) => ({ tasks: s.tasks.map((t) => (t._id === id ? data : t)) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message };
    }
  },
}));

export default useTaskStore;
