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

  // =========================================================
  // FETCH CATEGORIES
  // =========================================================
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");

      const data = res.data.data || [];

      setCategories(data);
      setFiltered(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
      toast.error("Failed to load categories.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================
  useEffect(() => {
    const f = categories.filter((c) =>
      c.name?.toLowerCase().includes(search.toLowerCase())
    );

    setFiltered(f);
    setCurrentPage(1);
  }, [search, categories]);

  // =========================================================
  // SORTING
  // =========================================================
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortOption === "date") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    if (sortOption === "subcategory") {
      return (
        (b.subcategories?.length || 0) -
        (a.subcategories?.length || 0)
      );
    }

    return 0;
  });

  // =========================================================
  // PAGINATION
  // =========================================================
  const totalPages = Math.ceil(sorted.length / entriesToShow);

  const startIndex = (currentPage - 1) * entriesToShow;

  const currentCategories = sorted.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // =========================================================
  // DELETE CATEGORY
  // =========================================================
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      await api.delete(`/delete-category/${id}`);

      toast.success("Category deleted successfully!");

      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category.");
    }
  };

  // =========================================================
  // VIEW MODAL
  // =========================================================
  const openModal = (cat) => {
    setSelectedCategory(cat);
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4">

      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="relative overflow-hidden bg-black rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-6 sm:py-8 mb-6 sm:mb-8 shadow-2xl border border-[#D4AF37]/40">

          {/* Golden Glow */}
          <div className="absolute -top-24 -right-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4">

            {/* Icon */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl sm:rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-[#D4AF37]/20">
              C
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Manage Categories
              </h1>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Organize and manage your product categories
              </p>
            </div>
          </div>
        </div>

        {/* =====================================================
            CONTROLS CARD
        ===================================================== */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

            {/* SEARCH */}
            <div className="w-full xl:w-80">

              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Search Categories
              </label>

              <input
                type="text"
                placeholder="Search categories..."
                className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">

              {/* SORT */}
              <div className="w-full sm:w-auto">

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Sort
                </label>

                <select
                  value={sortOption}
                  onChange={(e) => {
                    setSortOption(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                >
                  <option value="name">Sort by Name</option>
                  <option value="subcategory">
                    Sort by Subcategories
                  </option>
                  <option value="date">Newest First</option>
                </select>
              </div>

              {/* ENTRIES */}
              <div className="w-full sm:w-auto">

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Entries
                </label>

                <select
                  value={entriesToShow}
                  onChange={(e) => {
                    setEntriesToShow(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                >
                  <option value="10">Show 10</option>
                  <option value="20">Show 20</option>
                  <option value="50">Show 50</option>
                </select>
              </div>

              {/* ADD CATEGORY */}
              <div className="w-full sm:w-auto">

                <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">
                  Add
                </label>

                <button
                  onClick={() => navigate("/add-category")}
                  className="w-full sm:w-auto bg-[#D4AF37] hover:bg-[#b8941f] text-black px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#D4AF37]/10"
                >
                  <span className="text-xl leading-none">+</span>
                  Add New Category
                </button>
              </div>
            </div>
          </div>

          {/* SUMMARY */}
          <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">

            <p className="text-sm text-gray-400">
              Total Categories
            </p>

            <span className="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold">
              {sorted.length}
            </span>
          </div>
        </div>

        {/* =====================================================
            TABLE CARD
        ===================================================== */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 overflow-hidden">

          {/* TABLE */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[1050px] border-collapse">

              {/* TABLE HEADER */}
              <thead className="bg-black text-white border-b-2 border-[#D4AF37]">

                <tr>

                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Image
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Category Name
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Subcategories
                  </th>

                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>

                </tr>
              </thead>

              {/* TABLE BODY */}
              <tbody>

                {currentCategories.length > 0 ? (

                  currentCategories.map((cat) => (

                    <tr
                      key={cat.id}
                      className="border-b border-gray-800 hover:bg-[#D4AF37]/10 transition-colors group"
                    >

                      {/* ID */}
                      <td className="px-5 sm:px-8 py-4 sm:py-5 whitespace-nowrap">

                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-black text-gray-300 font-semibold text-sm border border-gray-700 group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37] transition">
                          #{cat.id}
                        </span>

                      </td>

                      {/* IMAGE */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700 group-hover:border-[#D4AF37] transition-all bg-black">

                          <img
                            src={`${process.env.REACT_APP_API_URL}/public/${cat.image}`}
                            alt={cat.name}
                            className="w-full h-full object-cover"
                          />

                        </div>

                      </td>

                      {/* NAME */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="font-semibold text-white group-hover:text-[#D4AF37] transition">
                          {cat.name}
                        </span>

                      </td>

                      {/* DESCRIPTION */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <div className="text-gray-400 max-w-xs line-clamp-2 leading-relaxed">
                          {cat.description || "—"}
                        </div>

                      </td>

                      {/* SUBCATEGORIES */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <span className="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 text-sm font-bold">
                          {cat.subcategories?.length || 0}
                        </span>

                      </td>

                      {/* ACTIONS */}
                      <td className="px-5 sm:px-8 py-4 sm:py-5">

                        <div className="flex items-center justify-center gap-2">

                          {/* VIEW */}
                          <button
                            onClick={() => openModal(cat)}
                            className="w-10 h-10 rounded-xl bg-black border border-gray-700 text-gray-300 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all flex items-center justify-center text-lg"
                            title="View"
                          >
                            👁
                          </button>

                          {/* EDIT */}
                          <button
                            onClick={() =>
                              navigate(`/update-category/${cat.id}`)
                            }
                            className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black hover:bg-[#b8941f] transition-all flex items-center justify-center text-lg shadow-md shadow-[#D4AF37]/10"
                            title="Edit"
                          >
                            ✏️
                          </button>

                          {/* DELETE */}
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="w-10 h-10 rounded-xl bg-black text-gray-300 border border-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center text-lg"
                            title="Delete"
                          >
                            🗑
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl mb-4">
                          📂
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                          No Categories Found
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Try changing your search or add a new category.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>
            </table>
          </div>

          {/* MOBILE SCROLL HINT */}
          <div className="block lg:hidden px-4 py-3 bg-black text-gray-400 text-xs text-center border-t border-[#D4AF37]/20">
            ← Swipe horizontally to view the complete table →
          </div>

          {/* =====================================================
              PAGINATION
          ===================================================== */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t border-gray-800 gap-4">

            {/* SHOWING */}
            <p className="text-sm text-gray-400 text-center lg:text-left">

              {sorted.length > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {startIndex + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-white">
                    {Math.min(
                      startIndex + entriesToShow,
                      sorted.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {sorted.length}
                  </span>{" "}
                  categories
                </>
              ) : (
                "Showing 0 categories"
              )}

            </p>

            {/* PAGINATION BUTTONS */}
            {totalPages > 0 && (

              <div className="flex flex-wrap items-center justify-center gap-2">

                {/* PREVIOUS */}
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Previous
                </button>

                {/* PAGE NUMBERS */}
                <div className="flex flex-wrap justify-center gap-2">

                  {[...Array(totalPages)].map((_, i) => (

                    <button
                      key={i}
                      onClick={() => changePage(i + 1)}
                      className={`min-w-[42px] px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        currentPage === i + 1
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/10"
                          : "bg-black text-gray-300 border-gray-700 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      {i + 1}
                    </button>

                  ))}

                </div>

                {/* NEXT */}
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Next
                </button>

              </div>

            )}

          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW CATEGORY MODAL
      ========================================================= */}
      {showModal && selectedCategory && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4">

          <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-[#D4AF37]/40 max-h-[95vh] flex flex-col">

            {/* MODAL HEADER */}
            <div className="relative bg-black text-white px-5 sm:px-8 py-5 sm:py-6 border-b border-[#D4AF37]">

              {/* Glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex items-center justify-between gap-4">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold">
                    C
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                      Category
                    </p>

                    <h3 className="text-xl sm:text-2xl font-bold truncate text-white">
                      {selectedCategory.name}
                    </h3>

                  </div>
                </div>

                {/* CLOSE */}
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 flex-shrink-0 rounded-xl border border-gray-700 text-gray-300 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition flex items-center justify-center text-xl"
                  title="Close"
                >
                  ✕
                </button>

              </div>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-5 sm:p-8 space-y-5 sm:space-y-6 overflow-y-auto">

              {/* IMAGE */}
              <div className="rounded-2xl overflow-hidden border border-[#D4AF37]/30 bg-black">

                <img
                  src={`${process.env.REACT_APP_API_URL}/public/${selectedCategory.image}`}
                  alt={selectedCategory.name}
                  className="w-full h-48 sm:h-56 object-cover"
                />

              </div>

              {/* DESCRIPTION */}
              <div>

                <div className="flex items-center gap-2 mb-3">

                  <span className="w-1 h-6 bg-[#D4AF37] rounded-full" />

                  <h4 className="font-bold text-white">
                    Description
                  </h4>

                </div>

                <p className="text-gray-400 leading-relaxed">
                  {selectedCategory.description ||
                    "No description available."}
                </p>

              </div>

              {/* SUBCATEGORIES */}
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 p-4 rounded-2xl">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                      Total
                    </p>

                    <p className="font-semibold text-white mt-1">
                      Subcategories
                    </p>

                  </div>

                  <span className="min-w-[48px] h-12 px-3 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold text-lg">
                    {selectedCategory.subcategories?.length || 0}
                  </span>

                </div>

              </div>
            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 sm:p-6 border-t border-gray-800">

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 sm:py-4 bg-[#D4AF37] hover:bg-[#b8941f] text-black rounded-xl sm:rounded-2xl font-bold transition-all"
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