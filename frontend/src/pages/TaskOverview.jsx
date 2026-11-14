import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, authHeaders } from "../api";
import StatusBadge from "../components/StatusBadge";

function TaskOverview() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getTasks();
  }, [status]);

  async function getTasks() {
    let url = `${API_URL}/tasks/`;
    if (status) {
      url = url + `?status=${status}`;
    }

    const response = await fetch(url, { headers: authHeaders() });

    if (response.ok) {
      setTasks(await response.json());
    }
  }

  const filters = [
    { value: "", label: "All" },
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Completed" },
    { value: "NOT_SUBMITTED", label: "Not Submitted" },
    { value: "OVERDUE", label: "Overdue" },
  ];

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Task Overview</h1>

      <div className="mb-4 flex gap-2">
        {filters.map((item) => (
          <button
            key={item.label}
            onClick={() => setStatus(item.value)}
            className={`rounded px-4 py-2 ${
              status === item.value ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Staff</th>
            <th className="border p-2 text-left">Deadline</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Created</th>
            <th className="border p-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">{task.title}</td>
              <td className="border p-2">{task.category_name}</td>
              <td className="border p-2">{task.staff_name}</td>
              <td className="border p-2">
                {new Date(task.deadline).toLocaleString()}
              </td>
              <td className="border p-2">
                <StatusBadge status={task.status} />
              </td>
              <td className="border p-2">
                {new Date(task.created_at).toLocaleDateString()}
              </td>
              <td className="border p-2">
                <Link to={`/tasks/${task.id}`} className="text-blue-600">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TaskOverview;