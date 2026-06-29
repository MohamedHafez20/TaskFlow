import useTaskStore from "../../store/useTaskStore";

function SidebarStats() {
  const tasks = useTaskStore((s) => s.tasks);

  const completed = tasks.filter(t => t.completed).length;

  return (
    <div className="mt-6 text-sm text-gray-400">
      <p>Total: {tasks.length}</p>
      <p>Done: {completed}</p>
    </div>
  );
}

export default SidebarStats;