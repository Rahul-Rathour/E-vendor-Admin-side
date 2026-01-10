import React, { useState, useEffect } from "react";
import api from "../api";
import SidebarMenu from "../components/SidebarMenu";
const AddSubcategory = () => {
  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    description: "",
    status: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // ✅ Fetch all categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data || []);
      } catch (error) {
        console.error("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("category_id", formData.category_id);
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("status", formData.status ? 1 : 0);
    if (image) form.append("image", image);

    try {
      const res = await api.post(`subcategories`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Subcategory added successfully!");
      setFormData({
        category_id: "",
        name: "",
        description: "",
        status: true,
      });
      setImage(null);
      setPreview(null);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors || {});
        setMessage("Please fix the errors below.");
      } else {
        setMessage("Something went wrong. Try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 via-white to-green-100 py-12">
      {/* Sidebar */}
      <SidebarMenu onToggle={(open) => setSidebarOpen(open)} />

      {/* Main Content */}
      <div
        className={`
        flex-1 transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-16"}
        px-4 sm:px-6 md:px-10
        flex justify-center
      `}
      >
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-green-100">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Add New Subcategory
          </h2>

          {/* Message */}
          {message && (
            <p
              className={`text-center mb-4 ${message.toLowerCase().includes("success")
                  ? "text-green-600"
                  : "text-red-600"
                }`}
            >
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Parent Category */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Select Parent Category
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.category_id ? "border-red-500" : "border-gray-300"
                  }`}
                required
              >
                <option value="">-- Choose Category --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category_id[0]}
                </p>
              )}
            </div>

            {/* Subcategory Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Subcategory Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter subcategory name"
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                required
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter subcategory description"
                rows="3"
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 ${errors.description ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.description[0]}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Subcategory Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full border rounded-xl px-4 py-2 focus:outline-none ${errors.image ? "border-red-500" : "border-gray-300"
                  }`}
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
              )}

              {preview && (
                <div className="mt-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-xl border shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-400"
              />
              <label className="text-gray-700 font-medium">Active</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-xl transition duration-300 disabled:opacity-50 shadow-md"
            >
              {loading ? "Adding..." : "Add Subcategory"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default AddSubcategory;
