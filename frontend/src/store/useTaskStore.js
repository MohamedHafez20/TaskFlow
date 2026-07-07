import { create } from "zustand";
import api from "../api/axios";

// Smart task intelligence function (preserved from original code)
const analyzeTask = (title) => {
  const codingKeywords = ["code", "react", "javascript", "debug", "fix", "build", "develop"];
  const workKeywords = ["meeting", "email", "report", "presentation", "call", "review"];
  const healthKeywords = ["exercise", "gym", "run", "yoga", "walk", "diet", "sleep"];
  const personalKeywords = ["shopping", "clean", "cook", "buy", "laundry", "organize"];

  const lowerTitle = title.toLowerCase();

  let category = "general";
  let priority = "medium";
  let icon = "📝";
  let estimatedTime = "1h";

  if (codingKeywords.some((kw) => lowerTitle.includes(kw))) {
    category = "coding";
    icon = "💻";
    priority = lowerTitle.includes("fix") || lowerTitle.includes("bug") ? "high" : "medium";
    estimatedTime = lowerTitle.includes("project") ? "4h" : "2h";
  } else if (workKeywords.some((kw) => lowerTitle.includes(kw))) {
    category = "work";
    icon = "💼";
    priority = "high";
    estimatedTime = "1h";
  } else if (healthKeywords.some((kw) => lowerTitle.includes(kw))) {
    category = "health";
    icon = "💪";
    priority = "high";
    estimatedTime = "1h";
  } else if (personalKeywords.some((kw) => lowerTitle.includes(kw))) {
    category = "personal";
    icon = "🎯";
    priority = "low";
    estimatedTime = "30m";
  }

  // Priority detection
  if (lowerTitle.includes("urgent") || lowerTitle.includes("asap")) {
    priority = "high";
  } else if (lowerTitle.includes("later") || lowerTitle.includes("maybe")) {
    priority = "low";
  }

  return { category, priority, icon, estimatedTime };
};

const useTaskStore = create((set, get) => ({
  tasks: [],
  globalSearch: '',
  pomodoroHistory: [],
  gamificationStats: null,
  isDeepSession: sessionStorage.getItem('pomodoroIsDeepSession') === 'true',
  setIsDeepSession: (val) => {
    sessionStorage.setItem('pomodoroIsDeepSession', val);
    set({ isDeepSession: val });
  },
  loading: false,
  pomodoroLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ loading: true });
    try {
      const { data } = await api.get('/tasks');
      const mappedTasks = data.map((t) => {
        const analyzed = analyzeTask(t.title);
        return {
          ...t,
          id: t._id,
          completed: t.status === 'done',
          pomodoroCompleted: 0,
          pomodoroSessions: 0,
          category: t.description || analyzed.category,
          estimatedTime: analyzed.estimatedTime,
          icon: analyzed.icon
        };
      });
      set({ tasks: mappedTasks, loading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch tasks', loading: false });
    }
  },

  fetchPomodoroHistory: async () => {
    set({ pomodoroLoading: true });
    try {
      const { data } = await api.get('/pomodoro/history');
      set({ pomodoroHistory: data, pomodoroLoading: false });
      return data;
    } catch (err) {
      set({
        error: err.response?.data?.message || 'Failed to fetch pomodoro history',
        pomodoroLoading: false,
      });
      return [];
    }
  },

  fetchGamificationStats: async () => {
    try {
      const { data } = await api.get('/gamification/my-stats');
      set({ gamificationStats: data });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to fetch gamification stats' });
      return null;
    }
  },

  awardGameScore: async ({ gameId, score = 0, xpEarned = 0, pointsEarned = 0 }) => {
    try {
      const { data } = await api.post('/gamification/game-score', {
        gameId,
        score,
        xpEarned,
        pointsEarned,
      });
      const stats = await get().fetchGamificationStats();
      return { success: true, data, stats };
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to award game score';
      set({ error: message });
      return { success: false, message };
    }
  },

  startPomodoroSession: async ({ mode = 'focus', duration, isDeepSession }) => {
    try {
      const { data } = await api.post('/pomodoro/start', { mode, duration, isDeepSession });
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to start session' };
    }
  },

  completePomodoroSession: async (sessionId) => {
    try {
      const { data } = await api.put(`/pomodoro/${sessionId}/complete`);
      set((state) => ({ pomodoroHistory: [data, ...state.pomodoroHistory] }));
      return { success: true, data };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Failed to complete session' };
    }
  },

  addTask: async (task) => {
    try {
      const analyzed = analyzeTask(task.title);
      const category = task.category || analyzed.category;
      const priority = task.priority || analyzed.priority;
      const status = task.completed ? 'done' : 'todo';

      const { data } = await api.post('/tasks', {
        title: task.title,
        priority: priority,
        description: category,
        status: status
      });

      const mapped = {
        ...data,
        id: data._id,
        completed: data.status === 'done',
        pomodoroCompleted: 0,
        pomodoroSessions: 0,
        category: data.description || analyzed.category,
        estimatedTime: analyzed.estimatedTime,
        icon: analyzed.icon
      };

      set((state) => ({
        tasks: [...state.tasks, mapped]
      }));
    } catch (err) {
      console.error("Failed to add task", err);
    }
  },

  editTask: async (id, newData) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;

    const analyzed = analyzeTask(newData.title || task.title);

    const updateBody = {};
    if (newData.title !== undefined) updateBody.title = newData.title;
    if (newData.priority !== undefined) updateBody.priority = newData.priority;
    if (newData.category !== undefined) updateBody.description = newData.category;
    if (newData.completed !== undefined) {
      updateBody.status = newData.completed ? 'done' : 'todo';
    }

    try {
      let updatedData = task;
      if (Object.keys(updateBody).length > 0) {
        const { data } = await api.put(`/tasks/${id}`, updateBody);
        updatedData = data;
      }

      set((state) => ({
        tasks: state.tasks.map((t) => {
          if (t.id === id) {
            const pCompleted = newData.pomodoroCompleted !== undefined ? newData.pomodoroCompleted : t.pomodoroCompleted;
            const pSessions = newData.pomodoroSessions !== undefined ? newData.pomodoroSessions : t.pomodoroSessions;
            return {
              ...t,
              title: updatedData.title,
              priority: updatedData.priority,
              status: updatedData.status,
              completed: updatedData.status === 'done',
              category: updatedData.description || analyzed.category,
              estimatedTime: analyzed.estimatedTime,
              pomodoroCompleted: pCompleted,
              pomodoroSessions: pSessions
            };
          }
          return t;
        })
      }));
    } catch (err) {
      console.error("Failed to update task", err);
    }
  },

  updateTask: (id, newData) => get().editTask(id, newData),

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    await get().editTask(id, { completed: newCompleted });
  },

  updatePomodoroSession: (id, sessions) => {
    set((state) => ({
      tasks: state.tasks.map((task) => (
        task.id === id
          ? { ...task, pomodoroSessions: sessions, pomodoroCompleted: sessions }
          : task
      )),
    }));
  },

  updateTaskPriority: async (id, priority) => {
    await get().editTask(id, { priority });
  },

  deleteTask: async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  },

  reorderTasks: (newOrder) => set({ tasks: newOrder }),

  setGlobalSearch: (value) => set({ globalSearch: value }),

  // Selectors / Helpers (Preserved from original code)
  getCompletionStats: () => {
    const state = get();
    const total = state.tasks.length;
    const completed = state.tasks.filter((t) => t.completed).length;
    return { total, completed, percentage: total === 0 ? 0 : (completed / total) * 100 };
  },

  getTasksByCategory: () => {
    const state = get();
    const categories = {};
    state.tasks.forEach((task) => {
      const cat = task.category || "general";
      if (!categories[cat]) {
        categories[cat] = [];
      }
      categories[cat].push(task);
    });
    return categories;
  },

  getTasksByDate: (date) => {
    const state = get();
    return state.tasks.filter(
      (t) => new Date(t.createdAt).toDateString() === new Date(date).toDateString()
    );
  },

  getTodayTasks: () => {
    const state = get();
    const today = new Date().toDateString();
    return state.tasks.filter((t) => new Date(t.createdAt).toDateString() === today);
  },

  getHighPriorityTasks: () => {
    const state = get();
    return state.tasks.filter((t) => !t.completed && t.priority === "high");
  },
}));

export default useTaskStore;
