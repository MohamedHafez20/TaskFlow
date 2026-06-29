import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useUserStore = create(
  persist(
    (set, get) => ({
      userName: "",
      userEmail: "",
      isAuthenticated: false,
      users: [], // Keep array for compatibility

      setUserName: (name) => {
        // Local name update (no backend update profile route)
        set({ userName: name });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          userName: "",
          userEmail: "",
          isAuthenticated: false,
        });
      },

      registerUser: async ({ name, email, password }) => {
        try {
          const { data } = await api.post('/auth/register', { name, email, password });
          if (data && data.token) {
            localStorage.setItem('token', data.token);
            set({
              userName: data.name,
              userEmail: data.email,
              isAuthenticated: true,
            });
            return { success: true };
          }
          return { success: false, message: 'Registration failed: Invalid response' };
        } catch (err) {
          const msg = err.response?.data?.message || 'Registration failed.';
          return { success: false, message: msg };
        }
      },

      loginUser: async ({ email, password }) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          if (data && data.token) {
            localStorage.setItem('token', data.token);
            set({
              userName: data.name,
              userEmail: data.email,
              isAuthenticated: true,
            });
            return { success: true };
          }
          return { success: false, message: 'Login failed: Invalid response' };
        } catch (err) {
          const msg = err.response?.data?.message || 'Invalid email or password.';
          return { success: false, message: msg };
        }
      },

      fetchCurrentUser: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
          const { data } = await api.get('/auth/me');
          set({
            userName: data.name,
            userEmail: data.email,
            isAuthenticated: true,
          });
        } catch (err) {
          console.error("Failed to fetch current user profile", err);
          get().logout();
        }
      },
    }),
    {
      name: "user-storage",
      // Save auth and details to local storage automatically via persist
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useUserStore;
