import React, { useEffect, useState } from "react";
import api from "../api"
import { useNavigate } from "react-router-dom";
import SidebarMenu from "./SidebarMenu";

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const fetchCategories = async () => {
    const res = await api.get(`/categories`);
    setCategories(res.data.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this category? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await api.delete(`delete-category/${id}`);
      fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category. Please try again.");
    }
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
          Manage Categories
        </h2>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">
            No categories available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="bg-white rounded-2xl border border-gray-200
                         shadow-sm hover:shadow-xl transition-all"
              >
                {/* Image */}
                <div className="h-56 bg-gray-100 flex items-center justify-center overflow-hidden rounded-t-2xl">
                  <img
                    src={`${process.env.REACT_APP_API_URL}/public/${cat.image}`}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {cat.name}
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                    {cat.description}
                  </p>

                  <p className="mt-3 text-sm font-medium text-green-600">
                    Subcategories:{" "}
                    {cat.subcategories ? cat.subcategories.length : 0}
                  </p>

                  {/* Actions */}
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() => navigate(`/update-category/${cat.id}`)}
                      className="flex-1 border border-blue-500 text-blue-600
                               py-2 rounded-lg hover:bg-blue-50 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="flex-1 border border-red-500 text-red-600
                               py-2 rounded-lg hover:bg-red-50 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

};

export default ManageCategories;
