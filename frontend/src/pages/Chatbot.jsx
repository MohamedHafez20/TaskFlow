
import TaskFlowChat from '../components/GrokChat'; // تم تحديث الاسم هنا

export default function Chatbot() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl p-6">
        <h1 className="text-3xl font-bold text-ink">
          <span className="text-purple-400">Task Flow</span> Chat
        </h1>
      </div>

    
      <TaskFlowChat />
    </div>
  );
}