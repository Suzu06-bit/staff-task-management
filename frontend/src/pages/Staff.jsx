import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, authHeaders, errorText } from "../api";

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getStaff();
  }, [search, filter]);

  async function getStaff() {
    let url = `${API_URL}/staff/?search=${encodeURIComponent(search)}`;
    if (filter) {
      url = url + `&is_active=${filter}`;
    }

    const response = await fetch(url, { headers: authHeaders() });

    if (response.ok) {
      setStaffList(await response.json());
    }
  }

  function clearForm() {
    setName("");
    setEmail("");
    setPhone("");
    setRole("");
    setEditId(null);
  }

  async function saveStaff(event) {
    event.preventDefault();

    let url = `${API_URL}/staff/`;
    let method = "POST";

    if (editId) {
      url = `${API_URL}/staff/${editId}/`;
      method = "PATCH";
    }

    const response = await fetch(url, {
      method: method,
      headers: authHeaders(),
      body: JSON.stringify({
        name: name,
        email: email,
        phone: phone,
        role: role,
      }),
    });

    if (response.ok) {
      alert(editId ? "Staff updated successfully." : "Staff added successfully.");
      clearForm();
      getStaff();
    } else {
      const data = await response.json();
      alert(errorText(data));
    }
  }

  function editStaff(staff) {
    setEditId(staff.id);
    setName(staff.name);
    setEmail(staff.email);
    setPhone(staff.phone);
    setRole(staff.role);
  }

  async function toggleActive(staff) {
    await fetch(`${API_URL}/staff/${staff.id}/`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify({ is_active: !staff.is_active }),
    });

    getStaff();
  }

  async function deleteStaff(staff) {
    if (!window.confirm(`Delete ${staff.name}? Their tasks will also be deleted.`)) {
      return;
    }

    await fetch(`${API_URL}/staff/${staff.id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    getStaff();
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Staff Management</h1>

      <form onSubmit={saveStaff} className="mb-8 grid max-w-3xl grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="rounded border p-3"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="rounded border p-3"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          className="rounded border p-3"
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
          className="rounded border p-3"
          required
        />

        <div className="flex gap-4">
          <button type="submit" className="rounded bg-blue-600 px-5 py-2 text-white">
            {editId ? "Update Staff" : "Add Staff"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={clearForm}
              className="rounded bg-gray-500 px-5 py-2 text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="mb-4 flex gap-4">
        <input
          type="text"
          placeholder="Search by name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-72 rounded border p-3"
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded border p-3"
        >
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Email</th>
            <th className="border p-2 text-left">Phone</th>
            <th className="border p-2 text-left">Role</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {staffList.map((staff) => (
            <tr key={staff.id}>
              <td className="border p-2">
                <Link to={`/staff/${staff.id}`} className="text-blue-600">
                  {staff.name}
                </Link>
              </td>
              <td className="border p-2">{staff.email}</td>
              <td className="border p-2">{staff.phone}</td>
              <td className="border p-2">{staff.role}</td>
              <td className="border p-2">
                {staff.is_active ? "Active" : "Inactive"}
              </td>
              <td className="flex gap-2 border p-2">
                <button
                  onClick={() => editStaff(staff)}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => toggleActive(staff)}
                  className="rounded bg-gray-600 px-3 py-1 text-white"
                >
                  {staff.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteStaff(staff)}
                  className="rounded bg-red-600 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Staff;