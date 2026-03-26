import React, { useState, useEffect } from "react";
import api from "../api";
import SidebarMenu from "./SidebarMenu";
import { toast } from "react-toastify";

const ManageSubcategory = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);

  // Filters / Search / Pagination / Sorting
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const token = localStorage.getItem("token");

  // ---------------- FETCH DATA ----------------
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

  // ---------------- FILTERING ----------------
  const filtered = subcategories.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ---------------- SORTING ----------------
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "date")
      return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(sorted.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentSubcats = sorted.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ---------------- EDIT HANDLERS ----------------
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

      fetchSubcategories();
      setEditingSubcat(null);
      toast.success("Subcategory updated successfully!")
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Updation Failed...");
    } 
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;

    try {
      await api.delete(`subcategories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSubcategories();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

      <div
        className={`transition-all duration-300 px-6 py-8`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Manage Subcategories
        </h2>

        {/* ---------------- TOP TOOLBAR ---------------- */}
        <div className="flex items-center justify-between mb-4">
          {/* Sorting */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="default">Sort By</option>
            <option value="name">Name (A–Z)</option>
            <option value="date">Newest First</option>
          </select>

          {/* Entries */}
          <select
            value={entriesToShow}
            onChange={(e) => {
              setEntriesToShow(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="10">Show 10</option>
            <option value="20">Show 20</option>
            <option value="50">Show 50</option>
          </select>

          {/* Search */}
          <input
            type="text"
            placeholder="Search subcategory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-60"
          />
        </div>

        {/* ---------------- TABLE ---------------- */}
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Subcategory</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentSubcats.map((sub) => {
                const categoryName =
                  categories.find((c) => c.id === sub.category_id)
                    ?.name || "Uncategorized";

                return (
                  <tr key={sub.id} className="border-b hover:bg-gray-50">
                    {/* Subcategory */}
                    <td className="px-4 py-3">{sub.id}</td>
                    <td className="px-4 py-3 flex items-center gap-3">
                      <img
                        src={
                          sub.image
                            ? `${process.env.REACT_APP_API_URL}/public/${sub.image}`
                            : "/placeholder.jpg"
                        }
                        className="w-14 h-14 rounded-md object-cover border"
                      />
                      <span className="font-semibold">{sub.name}</span>
                    </td>

                    {/* Category */}
                    <td className="px-4 py-3">{categoryName}</td>

                    {/* Description */}
                    <td className="px-4 py-3 text-gray-600">
                      {sub.description || "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 flex gap-3 text-xl">
                      <span
                        className="cursor-pointer"
                        onClick={() => handleEdit(sub)}
                      >
                        ✏️
                      </span>

                      <span
                        className="cursor-pointer"
                        onClick={() => handleDelete(sub.id)}
                      >
                        🗑️
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ---------------- PAGINATION ---------------- */}
        <div className="flex justify-between items-center mt-4 px-2">
          <span className="text-sm text-gray-600">
            Showing {currentSubcats.length} of {sorted.length} entries
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => changePage(currentPage - 1)}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`px-3 py-1 border rounded ${
                  currentPage === i + 1
                    ? "bg-green-600 text-white"
                    : ""
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() => changePage(currentPage + 1)}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      {editingSubcat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">
              Edit Subcategory
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Category */}
              <select
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category_id: e.target.value,
                  })
                }
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Name */}
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Subcategory Name"
              />

              {/* Description */}
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
                rows="3"
                className="w-full border rounded-lg px-4 py-2"
                placeholder="Description"
              />

              {/* Image */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full border rounded-lg px-4 py-2"
              />

              {preview && (
                <img
                  src={preview}
                  className="w-24 h-24 object-cover rounded border"
                />
              )}

              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg"
              >
                Update
              </button>

              <button
                type="button"
                className="ml-3 px-6 py-2 rounded-lg bg-gray-400 text-white"
                onClick={() => setEditingSubcat(null)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSubcategory;