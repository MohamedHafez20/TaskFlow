import { useState, useEffect } from "react";
import useTaskStore from "../../store/useTaskStore";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaLightbulb, FaFire, FaCheckCircle, FaTag, FaChevronDown, FaTimes } from "react-icons/fa";
import { useToast } from "../Ui/ToastProvider";

function TaskForm({ editingTask, setEditingTask }) {
  const addTask = useTaskStore((s) => s.addTask);
  const editTask = useTaskStore((s) => s.editTask);
  const { showToast } = useToast();

  const [title, setTitle] = useState(editingTask ? editingTask.title : "");
  const [category, setCategory] = useState(editingTask ? editingTask.category : "general");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCategory(editingTask.category);
    } else {
      setTitle("");
      setCategory("general");
    }
  }, [editingTask]);

  const categories = [
    { value: "general", label: "General", icon: "📝", color: "text-gray-400" },
    { value: "work", label: "Work", icon: "💼", color: "text-blue-400" },
    { value: "personal", label: "Personal", icon: "🎯", color: "text-green-400" },
    { value: "health", label: "Health", icon: "💪", color: "text-red-400" },
    { value: "coding", label: "Coding", icon: "💻", color: "text-purple-400" },
    { value: "learning", label: "Learning", icon: "📚", color: "text-yellow-400" },
  ];

  const [isCategoryManual, setIsCategoryManual] = useState(false);

  const getSuggestedClassification = (text) => {
    const normalized = text.toLowerCase();

    const categoryKeywords = {
      coding: ["code", "debug", "fix", "bug", "build", "deploy", "script", "feature", "refactor", "npm", "react", "frontend", "backend", "api"],
      work: ["meeting", "email", "report", "project", "client", "call", "office", "submit", "presentation", "review", "team", "schedule", "follow up", "deadline", "task", "update"],
      personal: ["birthday", "buy", "grocery", "dinner", "travel", "family", "friend", "appointment", "personal", "plan", "hobby", "shopping", "party"],
      health: ["exercise", "gym", "workout", "run", "doctor", "diet", "meditate", "yoga", "health", "fitness", "medicine", "sleep", "walk", "walk"],
      learning: ["read", "study", "learn", "course", "tutorial", "practice", "research", "skill", "exam", "homework", "book", "training", "lesson"],
    };

    const strongKeywords = ["urgent", "asap", "important", "deadline", "today", "now", "fix", "critical", "emergency", "must", "high priority", "immediate", "blocked", "review", "issue"];
    const weakKeywords = ["later", "someday", "optional", "maybe", "whenever", "low priority", "chill", "easy", "small", "if time", "nice to have", "later" ];
    const mediumKeywords = ["plan", "review", "update", "schedule", "prepare", "follow up", "check", "organize", "research", "draft", "start", "finish", "improve"];

    let category = "general";
    Object.entries(categoryKeywords).forEach(([key, keywords]) => {
      if (keywords.some((keyword) => normalized.includes(keyword))) {
        category = key;
      }
    });

    let priority = "Medium";
    if (strongKeywords.some((keyword) => normalized.includes(keyword))) {
      priority = "Strong";
    } else if (weakKeywords.some((keyword) => normalized.includes(keyword))) {
      priority = "Weak";
    } else if (mediumKeywords.some((keyword) => normalized.includes(keyword))) {
      priority = "Medium";
    }

    return { category, priority };
  };

  const suggestion = getSuggestedClassification(title);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title);
      setCategory(editingTask.category);
      setIsCategoryManual(false);
    } else {
      setTitle("");
      setCategory("general");
      setIsCategoryManual(false);
    }
  }, [editingTask]);

  useEffect(() => {
    if (!editingTask && !isCategoryManual) {
      setCategory(suggestion.category);
    }
  }, [title, editingTask, isCategoryManual]);

  function handleAdd() {
    if (!title.trim()) {
      showToast("Please enter a task title!", "error");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      if (editingTask) {
        editTask(editingTask.id, {
          title: title.trim(),
          category: category,
        });
        showToast("Task updated successfully", "success", "top-right");
        setEditingTask(null);
      } else {
        addTask({
          title: title.trim(),
          category: category,
        });
        showToast("Task added successfully", "success", "top-right");
      }
      setTitle("");
      setCategory("general");
      setShowSuggestion(false);
      setIsLoading(false);
    }, 500);
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleAdd();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Main Input */}
      <div className="relative">
        <motion.div
          className="bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl p-4 hover:border-purple-400/50 transition-all group"
          whileFocus={{ borderColor: "#a78bfa" }}
        >
<div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-3 flex-1">
              <FaLightbulb className="text-2xl text-yellow-400 opacity-70" />
              <input
                type="text"
                placeholder={window.innerWidth < 768 ? "What's your task?" : "What's your next task? (Try: 'debug react app' or 'meeting tomorrow')"}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="flex-1 bg-transparent text-white placeholder-gray-400 outline-none text-lg px-2"
              />
            </div>

            <div className="flex gap-2 items-center">
              {/* Category Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCategoryModal(true)}
                disabled={isLoading}
                className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl px-3 py-2 text-white hover:border-purple-400/50 transition-all flex items-center gap-2 min-w-0"
              >
                {categories.find(cat => cat.value === category)?.icon}
                <span className="hidden sm:inline">{categories.find(cat => cat.value === category)?.label}</span>
                <FaChevronDown className="text-sm" />
              </motion.button>

              {editingTask && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setEditingTask(null);
                    setTitle("");
                    setCategory("general");
                    setShowSuggestion(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-500 p-3 rounded-xl text-white transition-all min-w-0"
                >
                  <FaTimes />
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                disabled={isLoading || !title.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed p-3 rounded-xl text-white transition-all min-w-0"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <FaLightbulb />
                  </motion.div>
                ) : editingTask ? (
                  <FaCheckCircle />
                ) : (
                  <FaPlus />
                )}
              </motion.button>
            </div>
          </div>

          {/* Smart Suggestions */}
          {title.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 5 }}
              className="mt-3 pt-3 border-t border-white/10 space-y-2"
            >
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <FaLightbulb className="text-yellow-400" />
                <span className="font-semibold">🤖 AI Analysis:</span>
              </div>
              <div className="bg-white/5 rounded-lg p-3 space-y-1 text-sm">
                <p className="text-gray-300">Suggested category: <span className="font-semibold text-white">{categories.find((cat) => cat.value === suggestion.category)?.label || 'General'}</span></p>
                <p className={`font-semibold ${suggestion.priority === 'Strong' ? 'text-red-300' : suggestion.priority === 'Weak' ? 'text-green-300' : 'text-yellow-300'}`}>
                  Priority: {suggestion.priority === 'Strong' ? 'Strong' : suggestion.priority === 'Weak' ? 'Weak' : 'Medium'}
                </p>
                <p className="text-xs text-gray-400">
                  Based on keywords like {title.toLowerCase().includes('urgent') ? 'urgent' : title.toLowerCase().includes('meeting') ? 'meeting' : 'your task'}.
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Quick Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 border border-white/10 rounded-xl p-3"
      >
        <p className="text-xs text-gray-400 flex items-center gap-2">
          <FaFire className="text-orange-400" />
          💡 Pro Tip: Use keywords like "debug", "meeting", "exercise" for smart priority detection
        </p>
      </motion.div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCategoryModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowCategoryModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-gradient-to-br from-purple-900/95 to-blue-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-6 w-full max-w-sm"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FaTag className="text-purple-400" />
                    Choose Category
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowCategoryModal(false)}
                    className="text-white/70 hover:text-white"
                  >
                    <FaTimes />
                  </motion.button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setCategory(cat.value);
                        setShowCategoryModal(false);
                        setIsCategoryManual(true);
                      }}
                      className={`p-3 rounded-xl border transition-all text-left ${
                        category === cat.value
                          ? 'bg-purple-600/50 border-purple-400 text-white'
                          : 'bg-white/10 border-white/20 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      <div className="text-2xl mb-1">{cat.icon}</div>
                      <div className="text-sm font-semibold">{cat.label}</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default TaskForm;
