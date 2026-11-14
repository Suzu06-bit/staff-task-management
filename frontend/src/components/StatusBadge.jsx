function StatusBadge({ status }) {
  let color = "bg-yellow-500";

  if (status === "COMPLETED") {
    color = "bg-green-600";
  }
  if (status === "NOT_SUBMITTED") {
    color = "bg-red-600";
  }

  return (
    <span className={`rounded-full px-3 py-1 text-xs text-white ${color}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export default StatusBadge;