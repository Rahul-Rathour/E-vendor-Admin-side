import React, { useState, useEffect } from "react";
import api from "../api";
import { toast } from "react-toastify";

const ManageSubcategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [sortOption, setSortOption] = useState("default");
  const [currentPage, setCurrentPage] = useState(1);

  // Edit Modal State
  const [editingSubcat, setEditingSubcat] = useState(null);
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    image: null,
  });
  const [preview, setPreview] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch Data
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

  // Filtering & Sorting & Pagination (unchanged)
  const filtered = subcategories.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "date")
      return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentSubcats = sorted.slice(startIndex, startIndex + entriesToShow);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleEdit = (subcat) => {
    setEditingSubcat(subcat);
    setFormData({
      category_id: subcat.category_id,
      name: subcat.name,
      description: subcat.description || "",
      image: null,
    });
    setPreview(
      subcat.image
        ? `${process.env.REACT_APP_API_URL}/public/${subcat.image}`
        : null
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("category_id", formData.category_id);
    form.append("name", formData.name);
    form.append("description", formData.description);
    if (formData.image) form.append("image", formData.image);

    try {
      await api.post(`subcategories/${editingSubcat.id}`, form, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Subcategory updated successfully!");
      fetchSubcategories();
      setEditingSubcat(null);
      setPreview(null);
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Update failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await api.delete(`subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Subcategory deleted successfully!");
      fetchSubcategories();
    } catch (error) {
      toast.error("Failed to delete subcategory.");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header & Toolbar (same as before) */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl px-8 py-8 text-white mb-8">
          <h1 className="text-4xl font-bold">Manage Subcategories</h1>
          <p className="text-orange-100 mt-2">View, edit and manage all subcategories</p>
        </div>

        {/* Toolbar */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search subcategories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 w-full md:w-80"
            />

            <div className="flex flex-wrap gap-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500"
              >
                <option value="default">Sort By</option>
                <option value="name">Name (A–Z)</option>
                <option value="date">Newest First</option>
              </select>

              <select
                value={entriesToShow}
                onChange={(e) => {
                  setEntriesToShow(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500"
              >
                <option value="10">Show 10</option>
                <option value="20">Show 20</option>
                <option value="50">Show 50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table (unchanged) */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Subcategory</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Parent Category</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentSubcats.map((sub) => {
                  const categoryName = categories.find((c) => c.id === sub.category_id)?.name || "Uncategorized";
                  return (
                    <tr key={sub.id} className="hover:bg-orange-50 transition">
                      <td className="px-8 py-5 text-gray-600 font-medium">#{sub.id}</td>
                      <td className="px-6 py-5">
                        <img
                          src={sub.image ? `${process.env.REACT_APP_API_URL}/public/${sub.image}` : "/placeholder.jpg"}
                          className="w-14 h-14 rounded-2xl object-cover border border-orange-100"
                          alt={sub.name}
                        />
                      </td>
                      <td className="px-6 py-5 text-gray-700">{sub.name}</td>
                      <td className="px-6 py-5 text-gray-700">{categoryName}</td>
                      <td className="px-6 py-5 text-gray-600">{sub.description || "—"}</td>
                      <td className="px-8 py-5 text-center flex justify-center gap-5">
                        <button onClick={() => handleEdit(sub)} className="text-blue-600 text-2xl hover:scale-110 transition" title="Edit">✏️</button>
                        <button onClick={() => handleDelete(sub.id)} className="text-red-600 text-2xl hover:scale-110 transition" title="Delete">🗑</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination (unchanged) */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 border-t gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + entriesToShow, sorted.length)} of {sorted.length} subcategories
            </p>
            {/* Pagination buttons */}
          </div>
        </div>
      </div>

      {/* ==================== IMPROVED RESPONSIVE MODAL ==================== */}
      {editingSubcat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white rounded-t-3xl">
              <h3 className="text-2xl font-bold">Edit Subcategory</h3>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                required
              >
                <option value="">Select Parent Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="Subcategory Name"
                required
              />

              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                placeholder="Description"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                />
              </div>

              {preview && (
                <div className="flex justify-center">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-40 h-40 object-cover rounded-2xl border border-orange-200 shadow-sm"
                  />
                </div>
              )}

              {/* Action Buttons - Always Visible at Bottom */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSubcat(null);
                    setPreview(null);
                  }}
                  className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 font-medium"
                >
                  Update Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubcategory;