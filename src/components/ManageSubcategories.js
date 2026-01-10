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
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SidebarMenu onToggle={(open) => setSidebarOpen(open)} />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"
          } px-6 py-8`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Manage Subcategories
        </h2>

        {/* Message */}
        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}

        {/* Add / Edit Form */}
        <div className="max-w-3xl mx-auto mb-10 bg-white p-6 rounded-2xl shadow border">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">
            {editId ? "Edit Subcategory" : "Add New Subcategory"}
          </h3>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <select
              name="category_id"
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2"
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
              className="w-full border rounded-lg px-4 py-2"
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-lg px-4 py-2"
              rows="3"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border rounded-lg px-4 py-2"
            />

            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
              >
                {editId ? "Update Subcategory" : "Add Subcategory"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Subcategories Grid */}
        {subcategories.length === 0 ? (
          <p className="text-center text-gray-500">No subcategories found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {subcategories.map((subcat) => {
              const categoryName =
                categories.find((c) => c.id === subcat.category_id)?.name ||
                "Uncategorized";

              return (
                <div
                  key={subcat.id}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-xl transition"
                >
                  {/* Image */}
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    <img
                      src={
                        subcat.image
                          ? `${process.env.REACT_APP_API_URL}/public/${subcat.image}`
                          : "/placeholder.jpg"
                      }
                      alt={subcat.name}
                      className="h-full object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                      {categoryName}
                    </span>

                    <h3 className="mt-2 text-lg font-semibold text-gray-800">
                      {subcat.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {subcat.description || "No description"}
                    </p>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleEdit(subcat)}
                        className="flex-1 border border-yellow-500 text-yellow-600 py-2 rounded-lg hover:bg-yellow-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(subcat.id)}
                        className="flex-1 border border-red-500 text-red-600 py-2 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

};

export default ManageSubcategory;
