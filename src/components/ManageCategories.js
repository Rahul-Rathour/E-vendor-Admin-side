import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOption, setSortOption] = useState("name");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();

  // ---------------- FETCH ----------------
  const fetchCategories = async () => {
    const res = await api.get(`/categories`);
    setCategories(res.data.data);
    setFiltered(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ---------------- SEARCH ----------------
  useEffect(() => {
    const f = categories.filter((c) =>
      c.name.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(f);
    setCurrentPage(1);
  }, [search, categories]);

  // ---------------- SORTING ----------------
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "date")
      return new Date(b.created_at) - new Date(a.created_at);
    if (sortOption === "subcategory")
      return (b.subcategories?.length || 0) - (a.subcategories?.length || 0);
    return 0;
  });

  // ---------------- PAGINATION ----------------
  const totalPages = Math.ceil(sorted.length / entriesToShow);

  const startIndex = (currentPage - 1) * entriesToShow;
  const currentCategories = sorted.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirmDelete) return;

    try {
      await api.delete(`/delete-category/${id}`);
      fetchCategories();
    } catch (err) {
      alert("Delete failed");
    }
  };

  // ---------------- VIEW MODAL ----------------
  const openModal = (cat) => {
    setSelectedCategory(cat);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

      <div
        className={`transition-all duration-300 px-6 py-8`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Manage Categories
        </h2>

        {/* ---------------- TOP CONTROLS ---------------- */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          {/* Search */}
          <input
            type="text"
            placeholder="Search categories..."
            className="border px-3 py-2 rounded-lg w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Sort */}
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="name">Sort by Name</option>
            <option value="subcategory">Sort by Subcategories</option>
            <option value="date">Newest First</option>
          </select>

          {/* Entries */}
          <select
            value={entriesToShow}
            onChange={(e) => {
              setEntriesToShow(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="10">Show 10</option>
            <option value="20">Show 20</option>
            <option value="50">Show 50</option>
          </select>

          {/* Create New */}
          <button
            onClick={() => navigate("/create-category")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Add Category
          </button>
        </div>

        {/* ---------------- TABLE ---------------- */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-100">
                <th className="p-3">ID</th>
                <th className="p-3">Image</th>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Subcategories</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentCategories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{cat.id}</td>
                  <td className="p-3">
                    <img
                      src={`${process.env.REACT_APP_API_URL}/public/${cat.image}`}
                      alt={cat.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  </td>

                  <td className="p-3">{cat.name}</td>

                  <td className="p-3 text-gray-600 line-clamp-2">
                    {cat.description}
                  </td>

                  <td className="p-3 font-medium text-green-600">
                    {cat.subcategories?.length || 0}
                  </td>

                  <td className="p-3 text-center flex justify-center gap-3">
                    <button
                      onClick={() => openModal(cat)}
                      className="text-yellow-500 text-xl"
                    >
                      👁
                    </button>

                    <button
                      onClick={() => navigate(`/update-category/${cat.id}`)}
                      className="text-blue-600 text-xl"
                    >
                      ✏️
                    </button>

                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 text-xl"
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* ---------------- PAGINATION ---------------- */}
          <div className="flex justify-between items-center p-4">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1}–
              {Math.min(startIndex + entriesToShow, sorted.length)} of{" "}
              {sorted.length}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => changePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => changePage(i + 1)}
                  className={`px-3 py-1 border rounded ${currentPage === i + 1 ? "bg-blue-600 text-white" : ""
                    }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => changePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* ---------------- VIEW MODAL ---------------- */}
        {showModal && selectedCategory && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-xl shadow-xl w-[500px] relative">
              <button
                className="absolute top-2 right-3 text-xl"
                onClick={() => setShowModal(false)}
              >
                ✖
              </button>

              <h3 className="text-xl font-semibold mb-4">
                {selectedCategory.name}
              </h3>

              <img
                src={`${process.env.REACT_APP_API_URL}/public/${selectedCategory.image}`}
                className="w-full h-48 object-cover rounded"
                alt=""
              />

              <p className="mt-4 text-gray-600">
                {selectedCategory.description}
              </p>

              <p className="mt-3 font-medium">
                Subcategories:{" "}
                {selectedCategory.subcategories?.length || 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCategories;