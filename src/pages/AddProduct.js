import React, { useEffect, useState } from "react";
import api from "../api";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    subcategory_id: "",
  });
  const [preview, setPreview] = useState(null);
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(res.data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch subcategories whenever category changes
  useEffect(() => {
    if (!formData.category_id) {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcategory_id: "" }));
      return;
    }

    const fetchSubcategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("subcategories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // ✅ Filter subcategories belonging to selected category
        const filtered = res.data.data.filter(
          (sub) => sub.category_id === parseInt(formData.category_id)
        );
        setSubcategories(filtered);
      } catch (err) {
        console.error("Error fetching subcategories:", err);
      }
    };

    fetchSubcategories();
  }, [formData.category_id]);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
    else setPreview(null);
  };

  // ✅ Submit product
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});
    const token = localStorage.getItem("token");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category_id", formData.category_id);
      if (formData.subcategory_id) {
        formDataToSend.append("subcategory_id", formData.subcategory_id);
      }
      
      if (image) formDataToSend.append("image", image);

      const res = await api.post("add-product", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Product added successfully!");
      setFormData({
        name: "",
        price: "",
        description: "",
        category_id: "",
        subcategory_id: "",
      });
      setImage(null);
      setPreview(null);
    } catch (err) {
      if (err.response && err.response.status === 422) {
        setErrors(err.response.data.errors || {});
        setMessage("Please correct the highlighted errors.");
      } else {
        setMessage("Something went wrong while adding the product.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 via-white to-green-100 py-12">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-lg border border-green-100">
        <h2 className="text-2xl font-semibold text-green-700 mb-6 text-center">
          Add New Product
        </h2>

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
          {/* Product Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter product name"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300 ${errors.name ? "border-red-500" : "border-gray-300"
                }`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name[0]}</p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Price
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Enter price"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300 ${errors.price ? "border-red-500" : "border-gray-300"
                }`}
              required
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price[0]}</p>
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
              placeholder="Enter product description"
              rows="3"
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring focus:ring-green-300 ${errors.description ? "border-red-500" : "border-gray-300"
                }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description[0]}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Select Category
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${errors.category_id ? "border-red-500" : "border-gray-300"
                }`}
              required
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          {formData.category_id && (
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Select Subcategory
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${errors.subcategory_id ? "border-red-500" : "border-gray-300"
                  }`}

              >
                <option value="">-- Select Subcategory --</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
              {errors.subcategory_id && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.subcategory_id[0]}
                </p>
              )}
            </div>
          )}

          {/* Image */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className={`w-full border rounded-lg px-4 py-2 focus:outline-none ${errors.image ? "border-red-500" : "border-gray-300"
                }`}
            />
            {preview && (
              <div className="mt-3">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition duration-300 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
