import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaSave } from "react-icons/fa";
import api from "../api";

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: true,
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Fetch category details
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await api.get(`categories/${id}`);
        const category = res.data.data || res.data;

        setFormData({
          name: category.name || "",
          description: category.description || "",
          status: category.status === 1 || category.status === true,
        });

        if (category.image) {
          const fullUrl = category.image.startsWith("http")
            ? category.image
            : `${process.env.REACT_APP_API_URL || "https://sienna-woodpecker-713808.hostingersite.com"}/storage/${category.image}`;
          setExistingImage(fullUrl);
        }
      } catch (error) {
        console.error("Error loading category:", error);
        setMessage("Failed to load category details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [id]);

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
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});

    const form = new FormData();
    form.append("name", formData.name);
    form.append("description", formData.description);
    form.append("status", formData.status ? 1 : 0);
    if (image) form.append("image", image);

    try {
      const res = await api.post(`update-category/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Category updated successfully!");
      setTimeout(() => navigate("/manage-category"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
      } else {
        setMessage("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading category details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-3 bg-white rounded-2xl shadow hover:bg-gray-50 transition"
          >
            <FaArrowLeft className="text-gray-700" />
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Category</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          {message && (
            <div className={`mb-6 p-4 rounded-2xl text-center font-medium ${
              message.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Category Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className={`w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter category name"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className={`w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none transition ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter category description"
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description[0]}</p>}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className={`w-full px-5 py-3 border rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 ${
                  errors.image ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>}

              {/* Image Previews */}
              <div className="mt-4 flex gap-6">
                {existingImage && !preview && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Current Image</p>
                    <img
                      src={existingImage}
                      alt="Current"
                      className="w-32 h-32 object-cover rounded-2xl border border-gray-200"
                      onError={(e) => (e.target.style.display = "none")}
                    />
                  </div>
                )}

                {preview && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">New Image Preview</p>
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-2xl border border-gray-200"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="status"
                checked={formData.status}
                onChange={handleChange}
                className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="text-gray-700 font-medium">Active (Visible to users)</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition flex items-center justify-center gap-3 disabled:opacity-70"
            >
              <FaSave />
              {loading ? "Updating Category..." : "Update Category"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditCategory;