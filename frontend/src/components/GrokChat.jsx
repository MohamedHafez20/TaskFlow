import { useState, useEffect, useRef } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../api/axios';

export default function GrokChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chat', {
        messages: [...messages, userMessage],
      });

      // تصحيح مسار الوصول للبيانات بناءً على هيكلية الـ API التي أرسلتها سابقاً
      const data = response.data;
      const assistantText = data.output?.[0]?.content?.[0]?.text || data.output?.[0]?.content || 'No response from assistant.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantText }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev, 
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full rounded-[32px] border border-hair bg-card shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-hair p-5 flex items-center gap-3 bg-card2/50">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-900 text-violet-300">
          <FaRobot size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink">Task Flow Assistant</h2>
          <p className="text-[10px] text-muted">Your smart productivity partner</p>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-hair text-violet-500' : 'bg-accentPrimary text-white'}`}>
              {msg.role === 'assistant' ? <FaRobot size={14} /> : <FaUser size={14} />}
            </div>
            <div className={`max-w-[85%] p-4 rounded-[20px] text-sm text-ink leading-relaxed ${msg.role === 'assistant' ? 'bg-card2 border border-hair' : 'bg-accentPrimary text-white'}`}>
              <ReactMarkdown
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || '');
                    return match ? (
                      <SyntaxHighlighter style={vscDarkPlus} language={match[1]} PreTag="div" {...props}>
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    ) : (
                      <code className="bg-hair px-1 rounded" {...props}>{children}</code>
                    );
                  }
                }}
              >
                {msg.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-hair flex items-center justify-center text-violet-500">
              <FaRobot size={14} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-card2 border border-hair text-muted italic text-sm">Thinking...</div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="border-t border-hair bg-card p-4">
        <div className="relative flex items-center">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-2xl border border-hair bg-inputbg px-5 py-4 text-sm text-ink outline-none focus:border-accentPrimary"
            placeholder="Type your message here..."
          />
          <button type="submit" className="absolute right-3 p-2 text-violet-500 hover:text-ink transition">
            <FaPaperPlane size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}