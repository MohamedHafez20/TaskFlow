import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../api/axios";

const useUserStore = create(
  persist(
    (set, get) => ({
      userName: "",
      userEmail: "",
      avatarUrl: "",
      isAuthenticated: false,
      users: [], // Keep array for compatibility
      preferences: {
        autoStartBreaks: true,
        soundNotifications: true,
        deepFocusMood: false
      },

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
          avatarUrl: "",
          isAuthenticated: false,
          preferences: {
            autoStartBreaks: true,
            soundNotifications: true,
            deepFocusMood: false
          }
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
              avatarUrl: data.avatarUrl || "",
              isAuthenticated: true,
              preferences: data.preferences || {
                autoStartBreaks: true,
                soundNotifications: true,
                deepFocusMood: false
              }
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
              avatarUrl: data.avatarUrl || "",
              isAuthenticated: true,
              preferences: data.preferences || {
                autoStartBreaks: true,
                soundNotifications: true,
                deepFocusMood: false
              }
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
            avatarUrl: data.avatarUrl || "",
            isAuthenticated: true,
            preferences: data.preferences || {
              autoStartBreaks: true,
              soundNotifications: true,
              deepFocusMood: false
            }
          });
        } catch (err) {
          console.error("Failed to fetch current user profile", err);
          get().logout();
        }
      },

      updateName: async (name) => {
        try {
          const { data } = await api.put('/auth/me', { name });
          set({ userName: data.name });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update name.';
          return { success: false, message: msg };
        }
      },

      updateProfileName: async (name) => {
        try {
          const { data } = await api.patch('/users/profile/name', { name });
          set({ userName: data.name });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update name.';
          return { success: false, message: msg };
        }
      },

      updateProfileEmail: async (email) => {
        try {
          const { data } = await api.patch('/users/profile/email', { email });
          set({ userEmail: data.email });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update email.';
          return { success: false, message: msg };
        }
      },

      updateProfileAvatar: async (file) => {
        try {
          const formData = new FormData();
          formData.append('avatar', file);
          const { data } = await api.patch('/users/profile/avatar', formData);
          set({ avatarUrl: data.avatarUrl || "" });
          return { success: true, avatarUrl: data.avatarUrl || "" };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update profile picture.';
          return { success: false, message: msg };
        }
      },

      updatePreferences: async (prefs) => {
        try {
          const { data } = await api.put('/auth/me', { preferences: prefs });
          set({
            preferences: data.preferences || {
              autoStartBreaks: true,
              soundNotifications: true,
              deepFocusMood: false
            }
          });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to update preferences.';
          return { success: false, message: msg };
        }
      },

      changePassword: async ({ currentPassword, newPassword }) => {
        try {
          const { data } = await api.put('/auth/change-password', { currentPassword, newPassword });
          return { success: true, message: data.message };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to change password.';
          return { success: false, message: msg };
        }
      },

      forgotPassword: async (email) => {
        try {
          const { data } = await api.post('/auth/forgot-password', { email });
          return { success: true, message: data.message };
        } catch (err) {
          const msg = err.response?.data?.message || 'Failed to process forgot password request.';
          return { success: false, message: msg };
        }
      },
    }),
    {
      name: "user-storage",
      partialize: (state) => ({
        userName: state.userName,
        userEmail: state.userEmail,
        isAuthenticated: state.isAuthenticated,
        preferences: state.preferences,
      }),
    }
  )
);

export default useUserStore;
