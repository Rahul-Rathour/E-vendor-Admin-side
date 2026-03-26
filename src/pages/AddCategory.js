import React, { useState } from "react";
import api from "../api";
import SidebarMenu from "../components/SidebarMenu";

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null); // ✅ image preview
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({}); // ✅ Laravel validation errors
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file)); // ✅ show preview
    } else {
      setPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("status", formData.status ? 1 : 0);
    if (image) form.append("image", image);

    try {
      const res = await api.post(`add-category`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Category added successfully!");
      setFormData({ name: "", description: "", status: true });
      setImage(null);
      setPreview(null);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        // ✅ Laravel validation errors
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
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

      {/* Main Content */}
      <div 
        className={`
        flex-1 transition-all duration-300
        px-4 sm:px-6 md:px-10
        flex justify-center
      `}
      >
        <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-lg border border-green-100">
          <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
            Add New Category
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
            {/* Category Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
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
                placeholder="Enter category description"
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
                Category Image
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

              {/* Preview */}
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
              {loading ? "Adding..." : "Add Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );

};

export default AddCategory;
