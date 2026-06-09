import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

const AddCategory = () => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

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
      setPreview(URL.createObjectURL(file));
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

      toast.success(res.data.message || "Category added successfully!");
      
      // Reset form
      setFormData({ name: "", description: "", status: true });
      setImage(null);
      setPreview(null);
      setErrors({});
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setMessage("Please fix the errors below.");
      } else {
        setMessage("Something went wrong. Please try again!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl px-8 py-8 text-white text-center mb-8">
          <h1 className="text-4xl font-bold">Add New Category</h1>
          <p className="text-orange-100 mt-2">Create a new product category</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8">
          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${
              message.toLowerCase().includes("success") 
                ? "bg-green-50 text-green-700" 
                : "bg-red-50 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Name */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                className={`w-full border rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 transition-colors ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name[0]}</p>
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
                placeholder="Enter category description (optional)"
                rows="4"
                className={`w-full border rounded-2xl px-5 py-3 focus:outline-none focus:border-orange-500 transition-colors resize-y min-h-[100px] ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>
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
                className={`w-full border rounded-2xl px-5 py-3 text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200 transition-colors ${
                  errors.image ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.image && (
                <p className="text-red-600 text-sm mt-1">{errors.image[0]}</p>
              )}

              {/* Image Preview */}
              {preview && (
                <div className="mt-4 flex justify-center">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-40 h-40 object-cover rounded-3xl border-4 border-orange-100 shadow-md"
                    />
                    <div className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 shadow text-xs font-medium text-orange-600">
                      Preview
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status */}
            <div className="flex items-center gap-3 bg-orange-50 p-4 rounded-2xl">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="text-gray-700 font-medium cursor-pointer">
                Active (Visible to customers)
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-all duration-200 disabled:opacity-70 text-lg shadow-md"
            >
              {loading ? "Adding Category..." : "Add Category"}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          All fields marked with <span className="text-red-500">*</span> are required
        </p>
      </div>
    </div>
  );
};

export default AddCategory;