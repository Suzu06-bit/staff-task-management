import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { API_URL, authHeaders } from "../api";
import StatusBadge from "../components/StatusBadge";

function TaskDetails() {
  const { id } = useParams();
  const [task, setTask] = useState(null);

  useEffect(() => {
    getTask();
  }, [id]);

  async function getTask() {
    const response = await fetch(`${API_URL}/tasks/${id}/`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setTask(await response.json());
    }
  }

  if (!task) {
    return <p className="p-10">Loading...</p>;
  }

  const submission = task.submission;

  return (
    <div className="p-10">
      <Link to="/tasks" className="text-blue-600">
        &larr; Back
      </Link>

      <h1 className="mb-6 mt-2 text-3xl font-bold">{task.title}</h1>

      <div className="mb-6 space-y-2 rounded border p-5">
        <h2 className="text-xl font-bold">Task Information</h2>
        <p>Category: {task.category_name}</p>
        <p>Description: {task.description}</p>
        <p>
          Assigned staff: {task.staff_name} ({task.staff_email})
        </p>
        <p>Assigned date: {new Date(task.created_at).toLocaleString()}</p>
        <p>Deadline: {new Date(task.deadline).toLocaleString()}</p>
        <p>
          Status: <StatusBadge status={task.status} />
        </p>
      </div>

      <div className="space-y-2 rounded border p-5">
        <h2 className="text-xl font-bold">Submission Information</h2>

        {submission ? (
          <>
            <p>
              Submitted at: {new Date(submission.submitted_at).toLocaleString()}
            </p>
            <p>Comment: {submission.comment}</p>
            <p>
              <a
                href={submission.document}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600"
              >
                View
              </a>
              {" | "}
              <a href={submission.document} download className="text-blue-600">
                Download
              </a>
            </p>
          </>
        ) : (
          <p>Not submitted yet.</p>
        )}
      </div>
    </div>
  );
}

export default TaskDetails;