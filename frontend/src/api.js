export const API_URL = "http://127.0.0.1:8000/api";

// headers for admin pages (sends the login token)
export function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };
}

// turns a Django error into readable text
export function errorText(data) {
  if (data.detail) return data.detail;

  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}