import { create } from "zustand";

const STORAGE_KEY = "taskflow-theme";

// Read the persisted theme; default to dark (the app's original theme).
const getInitialTheme = () => {
  if (typeof window === "undefined") return "dark";
  return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
};

// Apply the theme by toggling the `light` class on <html>.
const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("light", theme === "light");
};

const useThemeStore = create((set, get) => ({
  theme: getInitialTheme(),

  setTheme: (theme) => {
    const next = theme === "light" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    set({ theme: next });
  },

  toggleTheme: () => {
    get().setTheme(get().theme === "dark" ? "light" : "dark");
  },
}));

export default useThemeStore;
