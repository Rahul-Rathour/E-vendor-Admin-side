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

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching categories", error);
      toast.error("Failed to load categories.");
    }
  };

  // Fetch Subcategories
  const fetchSubcategories = async () => {
    try {
      const res = await api.get("subcategories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSubcategories(res.data.data || []);
    } catch (error) {
      console.error("Error fetching subcategories", error);
      toast.error("Failed to load subcategories.");
    }
  };

  // Search
  const filtered = subcategories.filter((s) =>
    (s.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "name") {
      return (a.name || "").localeCompare(b.name || "");
    }

    if (sortOption === "date") {
      return new Date(b.created_at) - new Date(a.created_at);
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / entriesToShow);

  const startIndex = (currentPage - 1) * entriesToShow;

  const currentSubcats = sorted.slice(
    startIndex,
    startIndex + entriesToShow
  );

  const changePage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Edit Subcategory
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

  // Image Change
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    setFormData({
      ...formData,
      image: file,
    });

    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // Update Subcategory
  const handleUpdate = async (e) => {
    e.preventDefault();

    const form = new FormData();

    form.append("category_id", formData.category_id);
    form.append("name", formData.name);
    form.append("description", formData.description);

    if (formData.image) {
      form.append("image", formData.image);
    }

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

      setFormData({
        category_id: "",
        name: "",
        description: "",
        image: null,
      });
    } catch (error) {
      console.error("Update failed", error);
      toast.error("Update failed. Please try again.");
    }
  };

  // Delete Subcategory
  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this subcategory?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`subcategories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Subcategory deleted successfully!");

      fetchSubcategories();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete subcategory.");
    }
  };

  // Close Modal
  const closeModal = () => {
    setEditingSubcat(null);
    setPreview(null);

    setFormData({
      category_id: "",
      name: "",
      description: "",
      image: null,
    });
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4">

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden bg-black rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-6 sm:py-8 mb-6 sm:mb-8 shadow-2xl border border-[#D4AF37]/40">

          <div className="absolute -top-24 -right-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4">

            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl sm:rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-[#D4AF37]/20">
              S
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Manage Subcategories
              </h1>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                View, edit and manage all subcategories
              </p>
            </div>

          </div>
        </div>

        {/* ================= CONTROLS CARD ================= */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

            {/* Search */}
            <div className="w-full xl:w-80">

              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Search Subcategories
              </label>

              <input
                type="text"
                placeholder="Search subcategories..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
              />

            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">

              {/* Sort */}
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
                  <option value="default">Sort By</option>
                  <option value="name">Name (A–Z)</option>
                  <option value="date">Newest First</option>
                </select>

              </div>

              {/* Entries */}
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

            </div>
          </div>

          {/* Total */}
          <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">

            <p className="text-sm text-gray-400">
              Total Subcategories
            </p>

            <span className="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold">
              {sorted.length}
            </span>

          </div>

        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] border-collapse">

              {/* Table Header */}
              <thead className="bg-black text-white border-b-2 border-[#D4AF37]">

                <tr>

                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Image
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Subcategory
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Parent Category
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Description
                  </th>

                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* Table Body */}
              <tbody>

                {currentSubcats.length > 0 ? (

                  currentSubcats.map((sub) => {

                    const categoryName =
                      categories.find(
                        (c) => c.id === sub.category_id
                      )?.name || "Uncategorized";

                    return (

                      <tr
                        key={sub.id}
                        className="border-b border-gray-800 hover:bg-[#D4AF37]/10 transition-colors group"
                      >

                        {/* ID */}
                        <td className="px-5 sm:px-8 py-4 sm:py-5 whitespace-nowrap">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-black text-gray-300 font-semibold text-sm border border-gray-700 group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37] transition">
                            #{sub.id}
                          </span>

                        </td>

                        {/* Image */}
                        <td className="px-5 sm:px-6 py-4 sm:py-5">

                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border border-gray-700 group-hover:border-[#D4AF37] transition-all bg-black">

                            <img
                              src={
                                sub.image
                                  ? `${process.env.REACT_APP_API_URL}/public/${sub.image}`
                                  : "/placeholder.jpg"
                              }
                              alt={sub.name}
                              className="w-full h-full object-cover"
                            />

                          </div>

                        </td>

                        {/* Subcategory */}
                        <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                          <span className="font-semibold text-white group-hover:text-[#D4AF37] transition">
                            {sub.name}
                          </span>

                        </td>

                        {/* Parent Category */}
                        <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                          <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-semibold">
                            {categoryName}
                          </span>

                        </td>

                        {/* Description */}
                        <td className="px-5 sm:px-6 py-4 sm:py-5">

                          <div className="text-gray-400 max-w-xs line-clamp-2 leading-relaxed">
                            {sub.description || "—"}
                          </div>

                        </td>

                        {/* Actions */}
                        <td className="px-5 sm:px-8 py-4 sm:py-5">

                          <div className="flex items-center justify-center gap-2">

                            {/* Edit */}
                            <button
                              onClick={() => handleEdit(sub)}
                              className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black hover:bg-[#b8941f] transition-all flex items-center justify-center text-lg shadow-md shadow-[#D4AF37]/10"
                              title="Edit"
                            >
                              ✏️
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="w-10 h-10 rounded-xl bg-black text-gray-300 border border-gray-700 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-all flex items-center justify-center text-lg"
                              title="Delete"
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  })

                ) : (

                  <tr>

                    <td colSpan="6" className="px-6 py-16 text-center">

                      <div className="flex flex-col items-center justify-center">

                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl mb-4">
                          📂
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                          No Subcategories Found
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Try changing your search criteria.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Mobile Table Hint */}
          <div className="block lg:hidden px-4 py-3 bg-black text-gray-400 text-xs text-center border-t border-[#D4AF37]/20">
            ← Swipe horizontally to view the complete table →
          </div>

          {/* Pagination */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t border-gray-800 gap-4">

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
                  subcategories
                </>
              ) : (
                "Showing 0 subcategories"
              )}

            </p>

            {/* Pagination Buttons */}
            {totalPages > 0 && (

              <div className="flex flex-wrap items-center justify-center gap-2">

                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Previous
                </button>

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

      {/* ==================== EDIT SUBCATEGORY MODAL ==================== */}
      {editingSubcat && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 overflow-y-auto">

          <div className="bg-[#111111] w-full max-w-lg rounded-2xl sm:rounded-3xl shadow-2xl max-h-[95vh] flex flex-col border border-[#D4AF37]/40 overflow-hidden">

            {/* Modal Header */}
            <div className="relative bg-black text-white px-5 sm:px-8 py-5 sm:py-6 border-b border-[#D4AF37]">

              <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex items-center justify-between gap-4">

                <div className="flex items-center gap-3 min-w-0">

                  <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-[#D4AF37] text-black flex items-center justify-center font-bold">
                    S
                  </div>

                  <div className="min-w-0">

                    <p className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                      Subcategory
                    </p>

                    <h3 className="text-xl sm:text-2xl font-bold truncate text-white">
                      Edit Subcategory
                    </h3>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-10 h-10 flex-shrink-0 rounded-xl border border-gray-700 text-gray-300 hover:text-black hover:bg-[#D4AF37] hover:border-[#D4AF37] transition flex items-center justify-center text-xl"
                  title="Close"
                >
                  ✕
                </button>

              </div>

            </div>

            {/* Scrollable Form */}
            <form
              onSubmit={handleUpdate}
              className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-5 sm:space-y-6"
            >

              {/* Parent Category */}
              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Parent Category
                </label>

                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_id: e.target.value,
                    })
                  }
                  className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                  required
                >

                  <option value="">
                    Select Parent Category
                  </option>

                  {categories.map((c) => (

                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>

                  ))}

                </select>

              </div>

              {/* Subcategory Name */}
              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Subcategory Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      name: e.target.value,
                    })
                  }
                  className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                  placeholder="Enter subcategory name"
                  required
                />

              </div>

              {/* Description */}
              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Description
                </label>

                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition resize-none"
                  placeholder="Enter description"
                />

              </div>

              {/* Image Upload */}
              <div>

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Subcategory Image
                </label>

                <div className="bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl p-3">

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:bg-[#D4AF37] file:text-black file:font-semibold hover:file:bg-[#b8941f] file:cursor-pointer"
                  />

                </div>

              </div>

              {/* Preview */}
              {preview && (

                <div>

                  <div className="flex items-center gap-2 mb-3">

                    <span className="w-1 h-6 bg-[#D4AF37] rounded-full" />

                    <h4 className="font-bold text-white">
                      Image Preview
                    </h4>

                  </div>

                  <div className="flex justify-center">

                    <div className="w-40 h-40 rounded-2xl overflow-hidden border border-[#D4AF37]/40 bg-black">

                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />

                    </div>

                  </div>

                </div>

              )}

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-gray-800">

                <button
                  type="button"
                  onClick={closeModal}
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-black border border-gray-700 text-gray-300 rounded-xl sm:rounded-2xl hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 bg-[#D4AF37] text-black rounded-xl sm:rounded-2xl hover:bg-[#b8941f] font-bold transition-all shadow-lg shadow-[#D4AF37]/10"
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