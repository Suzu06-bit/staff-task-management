import { useEffect, useState } from "react";
import { API_URL, authHeaders, errorText } from "../api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    getCategories();
  }, []);

  async function getCategories() {
    const response = await fetch(`${API_URL}/categories/`, {
      headers: authHeaders(),
    });

    if (response.ok) {
      setCategories(await response.json());
    }
  }

  function clearForm() {
    setName("");
    setDescription("");
    setEditId(null);
  }

  async function saveCategory(event) {
    event.preventDefault();

    let url = `${API_URL}/categories/`;
    let method = "POST";

    if (editId) {
      url = `${API_URL}/categories/${editId}/`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: authHeaders(),
      body: JSON.stringify({
        name: name,
        description: description,
      }),
    });

    if (response.ok) {
      alert(editId ? "Category updated successfully." : "Category added successfully.");
      clearForm();
      getCategories();
    } else {
      const data = await response.json();
      alert(errorText(data));
    }
  }

  function editCategory(category) {
    setEditId(category.id);
    setName(category.name);
    setDescription(category.description);
  }

  async function deleteCategory(category) {
    if (!window.confirm(`Delete category "${category.name}"? Its tasks will also be deleted.`)) {
      return;
    }

    await fetch(`${API_URL}/categories/${category.id}/`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    getCategories();
  }

  return (
    <div className="p-10">
      <h1 className="mb-6 text-3xl font-bold">Categories</h1>

      <form onSubmit={saveCategory} className="mb-10 max-w-md space-y-4">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <textarea
          placeholder="Category description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="w-full rounded border p-3"
          required
        />

        <div className="flex gap-4">
          <button type="submit" className="rounded bg-blue-600 px-5 py-2 text-white">
            {editId ? "Update Category" : "Add Category"}
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

      <h2 className="mb-4 text-2xl font-bold">Category List</h2>

      {categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div className="grid grid-cols-3 gap-5">
          {categories.map((category) => (
            <div key={category.id} className="rounded border p-4">
              <h3 className="text-xl font-bold">{category.name}</h3>
              <p>{category.description}</p>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => editCategory(category)}
                  className="rounded bg-blue-600 px-3 py-1 text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteCategory(category)}
                  className="rounded bg-red-600 px-3 py-1 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Categories;