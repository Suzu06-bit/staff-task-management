import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL, authHeaders, errorText } from "../api";

function TaskAssign() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [staff, setStaff] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getCategories();
    getStaff();
  }, []);

  async function getCategories() {
    const response = await fetch(`${API_URL}/categories/`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setCategories(await response.json());
    }
  }

  // only active staff can get tasks
  async function getStaff() {
    const response = await fetch(`${API_URL}/staff/?is_active=true`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setStaffList(await response.json());
    }
  }

  async function assignTask(event) {
    event.preventDefault();
    setLoading(true);

    const response = await fetch(`${API_URL}/tasks/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        title: title,
        category: Number(category),
        description: description,
        deadline: new Date(deadline).toISOString(),
        staff: Number(staff),
      }),
    });

    setLoading(false);

    if (response.ok) {
      alert("Task assigned and email sent.");
      navigate("/tasks");
    } else {
      const data = await response.json();
      alert(errorText(data));
    }
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Assign Task</h1>

      <form onSubmit={assignTask} className="max-w-md space-y-4">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="w-full rounded border p-3"
          required
        >
          <option value="">Select Category</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded border p-3"
          rows="5"
          required
        />

        <input
          type="datetime-local"
          value={deadline}
          onChange={(event) => setDeadline(event.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <select
          value={staff}
          onChange={(event) => setStaff(event.target.value)}
          className="w-full rounded border p-3"
          required
        >
          <option value="">Select Staff</option>
          {staffList.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} ({item.email})
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-5 py-2 text-white"
        >
          {loading ? "Assigning..." : "Assign Task"}
        </button>
      </form>
    </div>
  );
}

export default TaskAssign;