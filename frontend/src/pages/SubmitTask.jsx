import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL, errorText } from "../api";
import StatusBadge from "../components/StatusBadge";

function SubmitTask() {
  const { token } = useParams();

  const [task, setTask] = useState(null);
  const [invalid, setInvalid] = useState(false);
  const [comment, setComment] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    getTask();
  }, [token]);

  async function getTask() {
    const response = await fetch(`${API_URL}/submit/${token}/`);

    if (response.ok) {
      setTask(await response.json());
    } else {
      setInvalid(true);
    }
  }

  async function submitTask(event) {
    event.preventDefault();

    // file upload uses FormData (do not set Content-Type)
    const formData = new FormData();
    formData.append("comment", comment);
    formData.append("document", file);

    const response = await fetch(`${API_URL}/submit/${token}/`, {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.detail);
    } else {
      alert(errorText(data));
    }

    getTask();
  }

  if (invalid) {
    return <p className="p-10 text-xl font-bold">Invalid link.</p>;
  }

  if (!task) {
    return <p className="p-10">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-xl space-y-3 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold">{task.title}</h1>
        <p>Category: {task.category}</p>
        <p>Description: {task.description}</p>
        <p>Assigned date: {new Date(task.assigned_date).toLocaleString()}</p>
        <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
        <p>
          Status: <StatusBadge status={task.status} />
        </p>

        <hr />

        {task.status === "PENDING" && (
          <form onSubmit={submitTask} className="space-y-4">
            <textarea
              placeholder="Submission comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="w-full rounded border p-3"
              rows="4"
              required
            />

            <input
              type="file"
              onChange={(event) => setFile(event.target.files[0])}
              className="w-full rounded border p-3"
              required
            />

            <button
              type="submit"
              className="rounded bg-blue-600 px-5 py-2 text-white"
            >
              Submit Task
            </button>
          </form>
        )}

        {task.status === "COMPLETED" && (
          <p className="text-green-600">This task has been submitted. Thank you!</p>
        )}

        {task.status === "NOT_SUBMITTED" && (
          <p className="text-red-600">The deadline has passed. Submission is closed.</p>
        )}
      </div>
    </div>
  );
}

export default SubmitTask;