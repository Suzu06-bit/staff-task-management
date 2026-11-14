import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, authHeaders } from "../api";
import StatusBadge from "../components/StatusBadge";

function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    getDashboard();
  }, []);

  async function getDashboard() {
    const response = await fetch(`${API_URL}/dashboard/`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setData(await response.json());
    }
  }

  if (!data) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Dashboard</h1>

      <div className="mb-10 grid grid-cols-5 gap-4">
        <div className="rounded border p-4 shadow">
          <p>Total Tasks</p>
          <p className="text-3xl font-bold">{data.total}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Pending</p>
          <p className="text-3xl font-bold">{data.pending}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Completed</p>
          <p className="text-3xl font-bold">{data.completed}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Not Submitted</p>
          <p className="text-3xl font-bold">{data.not_submitted}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Overdue</p>
          <p className="text-3xl font-bold">{data.overdue}</p>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Recent Tasks</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Staff</th>
            <th className="border p-2 text-left">Deadline</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.recent.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">
                <Link to={`/tasks/${task.id}`} className="text-blue-600">
                  {task.title}
                </Link>
              </td>
              <td className="border p-2">{task.staff_name}</td>
              <td className="border p-2">
                {new Date(task.deadline).toLocaleString()}
              </td>
              <td className="border p-2">
                <StatusBadge status={task.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Dashboard;