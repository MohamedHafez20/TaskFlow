import { useState, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../api/axios';

export default function GrokChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const systemPrompt = 'You are a helpful Task Flow assistant focused on productivity, study support, and task planning.';

  // دالة الترحيب الذكي بناءً على الوقت
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ready to tackle some tasks today?";
    if (hour < 18) return "Good afternoon! How can I assist you with your tasks?";
    return "Good evening! How was your day? What tasks would you like to work on?";
  };

  useEffect(() => {
    setMessages([{ role: 'assistant', content: getGreeting() }]);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        messages: [{ role: 'system', content: systemPrompt }, ...nextMessages],
      });

      const data = response.data;
      const assistantText = data.output?.[0]?.content?.[0]?.text || data.output?.[0]?.content || 'لا توجد استجابة من المساعد.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'sorry something wrong is happend' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] rounded-3xl bg-[#13131a] border border-white/[0.05] shadow-2xl overflow-hidden">
      {/* الهيدر */}
      <div className="p-5 border-b border-white/[0.05] flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900 text-purple-300">
          <FaRobot size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-purple-300">Task Flow Assistant</h2>
          <p className="text-[10px] text-slate-400">Your smart assistant for studying and planning</p>
        </div>
      </div>

    
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'assistant' ? 'bg-slate-800 text-purple-400' : 'bg-purple-600 text-white'}`}>
              {message.role === 'assistant' ? <FaRobot size={12} /> : <FaUser size={12} />}
            </div>
            <div className={`p-3.5 rounded-2xl text-sm max-w-[85%] ${
              message.role === 'assistant'
                ? 'bg-slate-900 text-slate-200 border border-white/[0.03]'
                : 'bg-purple-950 text-white border border-purple-500/20'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-purple-400">
              <FaRobot size={12} />
            </div>
            <div className="text-slate-500 text-xs py-2 animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      {/* منطقة الإدخال */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/[0.05] bg-[#13131a]">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anything"
            className="w-full rounded-2xl border border-white/[0.08] bg-[#0f1020] px-4 py-3.5 text-sm text-white outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 p-2 text-purple-400 hover:text-white transition disabled:opacity-30"
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}