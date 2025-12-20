import React, { useState, useEffect } from "react";
import api from "../api";
import SidebarMenu from "./SidebarMenu";

const ManageSubcategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [message, setMessage] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("token");

  // Fetch all categories and subcategories
  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories", error);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const res = await api.get("subcategories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubcategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching subcategories", error);
    }
  };

  // Handle add or update
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("category_id", formData.category_id);
    form.append("name", formData.name);
    form.append("description", formData.description);
    if (image) form.append("image", image);

    try {
      if (editId) {
        // Update existing subcategory
        await api.post(`subcategories/${editId}`, form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("Subcategory updated successfully!");
      } else {
        // Add new subcategory
        await api.post("subcategories", form, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setMessage("Subcategory added successfully!");
      }

      fetchSubcategories();
      resetForm();
    } catch (error) {
      console.error("Error saving subcategory", error);
      setMessage("Something went wrong!");
    }
  };

  const resetForm = () => {
    setFormData({ category_id: "", name: "", description: "" });
    setImage(null);
    setPreview(null);
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?"))
      return;

    try {
      await api.delete(`subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Subcategory deleted successfully!");
      fetchSubcategories();
    } catch (error) {
      console.error("Error deleting subcategory", error);
    }
  };

  const handleEdit = (subcat) => {
    setEditId(subcat.id);
    setFormData({
      category_id: subcat.category_id,
      name: subcat.name,
      description: subcat.description || "",
    });
    setPreview(subcat.image ? `${process.env.REACT_APP_API_URL}/public/${subcat.image}` : null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Sidebar */}
      <SidebarMenu onToggle={(open) => setSidebarOpen(open)} />

      {/* Main Content */}
      <div
        className={`
        flex-1 transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-16"}
        p-4 sm:p-6 lg:p-8
      `}
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">
            Manage Subcategories
          </h2>

          {/* Add / Edit Subcategory Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-white p-5 shadow rounded-lg mb-6 space-y-3"
          >
            <select
              name="category_id"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full border rounded p-2"
              required
            >
              <option value="">Select Parent Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Subcategory Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full border rounded p-2"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded p-2"
            ></textarea>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded p-2"
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded mt-2"
              />
            )}

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {editId ? "Update Subcategory" : "Add Subcategory"}
            </button>

            {editId && (
              <button
                type="button"
                onClick={resetForm}
                className="ml-3 bg-gray-400 text-white px-3 py-2 rounded hover:bg-gray-500"
              >
                Cancel Edit
              </button>
            )}
          </form>

          {message && (
            <p className="text-center text-green-600 font-medium mb-4">
              {message}
            </p>
          )}

          {/* List Subcategories */}
          <div className="space-y-4">
            {subcategories.map((subcat) => (
              <div
                key={subcat.id}
                className="bg-white shadow rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      subcat.image
                        ? `${process.env.REACT_APP_API_URL}/public/${subcat.image}`
                        : "/placeholder.jpg"
                    }
                    alt={subcat.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{subcat.name}</h3>
                    <p className="text-sm text-gray-500">
                      Category:{" "}
                      {
                        categories.find((c) => c.id === subcat.category_id)
                          ?.name
                      }
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(subcat)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(subcat.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div >
  );
};

export default ManageSubcategory;
