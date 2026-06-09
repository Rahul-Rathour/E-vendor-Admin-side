import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data || []);
      setFiltered(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Search
  useEffect(() => {
    const f = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [search, categories]);

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "date")
      return new Date(b.created_at) - new Date(a.created_at);
    if (sortOption === "subcategory")
      return (b.subcategories?.length || 0) - (a.subcategories?.length || 0);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / entriesToShow);
  const startIndex = (currentPage - 1) * entriesToShow;
  const currentCategories = sorted.slice(startIndex, startIndex + entriesToShow);

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // Delete Category
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;

    try {
      await api.delete(`/delete-category/${id}`);
      toast.success("Category deleted successfully!");
      fetchCategories();
    } catch (err) {
      toast.error("Failed to delete category.");
    }
  };

  // View Modal
  const openModal = (cat) => {
    setSelectedCategory(cat);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl px-8 py-8 text-white mb-8">
          <h1 className="text-4xl font-bold">Manage Categories</h1>
          <p className="text-orange-100 mt-2">Organize and manage your product categories</p>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <input
              type="text"
              placeholder="Search categories..."
              className="border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 w-full md:w-80"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500"
              >
                <option value="name">Sort by Name</option>
                <option value="subcategory">Sort by Subcategories</option>
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

              <button
                onClick={() => navigate("/add-category")}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition"
              >
                + Add New Category
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-8 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Image</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Category Name</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Description</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Subcategories</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentCategories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-orange-50 transition">
                    <td className="px-8 py-5 text-gray-600 font-medium">#{cat.id}</td>
                    <td className="px-6 py-5">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/public/${cat.image}`}
                        alt={cat.name}
                        className="w-14 h-14 object-cover rounded-2xl border border-orange-100"
                      />
                    </td>
                    <td className="px-6 py-5 font-semibold text-gray-800">{cat.name}</td>
                    <td className="px-6 py-5 text-gray-600 line-clamp-2 max-w-xs">
                      {cat.description || "—"}
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-block bg-orange-100 text-orange-700 px-4 py-1 rounded-2xl text-sm font-medium">
                        {cat.subcategories?.length || 0}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-center flex justify-center gap-4">
                      <button
                        onClick={() => openModal(cat)}
                        className="text-2xl hover:scale-110 transition"
                        title="View"
                      >
                        👁
                      </button>
                      <button
                        onClick={() => navigate(`/update-category/${cat.id}`)}
                        className="text-blue-600 text-2xl hover:scale-110 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        className="text-red-600 text-2xl hover:scale-110 transition"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center px-8 py-6 border-t gap-4">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + entriesToShow, sorted.length)} of{" "}
              {sorted.length} categories
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-5 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Previous
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => changePage(i + 1)}
                  className={`px-5 py-3 rounded-2xl border transition ${
                    currentPage === i + 1
                      ? "bg-orange-600 text-white border-orange-600"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-5 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {showModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
              <h3 className="text-2xl font-bold">{selectedCategory.name}</h3>
            </div>

            <div className="p-8 space-y-6">
              <img
                src={`${process.env.REACT_APP_API_URL}/public/${selectedCategory.image}`}
                alt={selectedCategory.name}
                className="w-full h-56 object-cover rounded-2xl"
              />

              <p className="text-gray-600 leading-relaxed">
                {selectedCategory.description || "No description available."}
              </p>

              <div className="bg-orange-50 p-4 rounded-2xl">
                <p className="font-medium text-orange-800">
                  Subcategories: <span className="font-bold">{selectedCategory.subcategories?.length || 0}</span>
                </p>
              </div>
            </div>

            <div className="p-6 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-4 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageCategories;