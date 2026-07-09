import { useState, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import api from '../api/axios';

export default function GrokChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const systemPrompt = 'You are a helpful Task Flow assistant focused on productivity, study support, and task planning.';

  // hello message based on time of day
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
      const assistantText = data.output?.[0]?.content?.[0]?.text || data.output?.[0]?.content || 'No response from the assistant.';

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
    <div className="flex flex-col h-[560px] rounded-[32px] border border-hair bg-card shadow-2xl overflow-hidden">
      
      <div className="border-b border-hair bg-slate-950/40 p-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-900 text-purple-300">
          <FaRobot size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-purple-300">Task Flow Assistant</h2>
          <p className="text-[10px] text-muted">Your smart assistant for studying and planning</p>
        </div>
      </div>

    
      <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.12),transparent_55%)] p-5 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.role === 'assistant' ? 'bg-slate-800 text-purple-400' : 'bg-purple-600 text-white'}`}>
              {message.role === 'assistant' ? <FaRobot size={12} /> : <FaUser size={12} />}
            </div>
            <div className={`max-w-[85%] rounded-[20px] p-3.5 text-sm leading-6 ${
              message.role === 'assistant'
                ? 'border border-hair bg-slate-900/90 text-slate-200 shadow-sm'
                : 'border border-purple-500/20 bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white'
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
            <div className="rounded-[20px] border border-hair bg-slate-900/90 px-4 py-3 text-sm text-muted">
              <span className="inline-flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:120ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:240ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      
      <form onSubmit={handleSubmit} className="border-t border-hair bg-card p-4">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about anything"
            className="w-full rounded-2xl border border-hair bg-inputbg px-4 py-3.5 text-sm text-ink outline-none focus:border-purple-500/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 p-2 text-purple-400 hover:text-ink transition disabled:opacity-30"
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}