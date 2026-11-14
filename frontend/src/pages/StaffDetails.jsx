import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL, authHeaders } from "../api";
import StatusBadge from "../components/StatusBadge";

function StaffDetails() {
  const { id } = useParams();
  const [staff, setStaff] = useState(null);

  useEffect(() => {
    getStaff();
  }, [id]);

  async function getStaff() {
    const response = await fetch(`${API_URL}/staff/${id}/details/`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setStaff(await response.json());
    }
  }

  if (!staff) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <div className="p-10">
      <Link to="/staff" className="text-blue-600">
        &larr; Back
      </Link>

      <h1 className="mb-4 mt-2 text-3xl font-bold">{staff.name}</h1>

      <div className="mb-6 rounded border p-4">
        <p>Email: {staff.email}</p>
        <p>Phone: {staff.phone}</p>
        <p>Role: {staff.role}</p>
        <p>Status: {staff.is_active ? "Active" : "Inactive"}</p>
      </div>

      <div className="mb-8 grid grid-cols-4 gap-4">
        <div className="rounded border p-4 shadow">
          <p>Total assigned</p>
          <p className="text-3xl font-bold">{staff.stats.total}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Pending</p>
          <p className="text-3xl font-bold">{staff.stats.pending}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Completed</p>
          <p className="text-3xl font-bold">{staff.stats.completed}</p>
        </div>
        <div className="rounded border p-4 shadow">
          <p>Not submitted</p>
          <p className="text-3xl font-bold">{staff.stats.not_submitted}</p>
        </div>
      </div>

      <h2 className="mb-4 text-2xl font-bold">Task History</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Title</th>
            <th className="border p-2 text-left">Category</th>
            <th className="border p-2 text-left">Deadline</th>
            <th className="border p-2 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {staff.history.map((task) => (
            <tr key={task.id}>
              <td className="border p-2">
                <Link to={`/tasks/${task.id}`} className="text-blue-600">
                  {task.title}
                </Link>
              </td>
              <td className="border p-2">{task.category_name}</td>
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

export default StaffDetails;