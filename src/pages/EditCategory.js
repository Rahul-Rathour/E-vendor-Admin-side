import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(true); // start loading as true
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Fetch category details on mount
  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const category = res.data.data;
        setFormData({
          name: category.name,
          description: category.description || "",
          status: category.status,
        });

        // ✅ Build full image URL if not already absolute
        if (category.image) {
          const fullUrl = category.image.startsWith("http")
            ? category.image
            : `${process.env.REACT_APP_API_URL}/storage/${category.image}`;
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

  // ✅ Handle form field change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ✅ Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // ✅ Submit update
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
      const res = await api.post(`update-category/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Category updated successfully!");
      navigate("/manage-category");
    } catch (err) {
      console.error("Update error:", err);
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

  // ✅ Show loader while fetching data
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-blue-600 text-lg font-medium animate-pulse">
          Loading category details...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-100 via-white to-blue-50 py-12">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-blue-100">
        <h2 className="text-2xl font-semibold text-blue-700 mb-6 text-center">
          Edit Category
        </h2>

        {message && (
          <p
            className={`text-center mb-4 ${
              message.toLowerCase().includes("success")
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
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 ${
                errors.name ? "border-red-500" : "border-gray-300"
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
              rows="3"
              placeholder="Enter category description"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-blue-300 ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description[0]}
              </p>
            )}
          </div>

          {/* Image Upload + Preview */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Category Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${
                errors.image ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.image && (
              <p className="text-red-500 text-sm mt-1">{errors.image[0]}</p>
            )}

            {existingImage && !preview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">Current Image:</p>
                <img
                  src={existingImage}
                  alt="Current"
                  className="w-32 h-32 object-cover rounded-lg border"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {preview && (
              <div className="mt-3">
                <p className="text-sm text-gray-600 mb-1">New Image Preview:</p>
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="status"
              checked={formData.status}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-400"
            />
            <label className="text-gray-700">Active</label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCategory;
