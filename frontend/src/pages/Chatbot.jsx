// 🤖 Chatbot Page — أرساني's task (placeholder)
import { Bot } from 'lucide-react';

export default function Chatbot() {
  return (
    <div className="p-8 flex flex-col items-center justify-center h-full">
      <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
        <Bot size={40} className="text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">AI Chatbot</h2>
      <p className="text-slate-400 text-center max-w-sm">
        Your productivity assistant is coming soon.<br />
        <span className="text-blue-400 font-medium">أرساني</span> will build this feature 🚀
      </p>
    </div>
  );
}
