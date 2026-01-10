import React, { useEffect, useState } from "react";
import api from "../api";
import SidebarMenu from "../components/SidebarMenu";

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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    <div className="min-h-screen bg-gray-100">
      <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"
          } px-6 py-10 flex justify-center`}
      >
        <div className="w-full max-w-2xl">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200">

            {/* Header */}
            <div className="border-b px-8 py-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Add New Product
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Fill in the details below to add a new product
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-6">
              {message && (
                <p
                  className={`mb-4 text-sm ${message.toLowerCase().includes("success")
                      ? "text-green-600"
                      : "text-red-600"
                    }`}
                >
                  {message}
                </p>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Apple iPhone 15"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.name[0]}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="₹ 999"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                  {errors.price && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.price[0]}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Short product description"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3
                             focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select category</option>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subcategory
                    </label>
                    <select
                      name="subcategory_id"
                      value={formData.subcategory_id}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-300 px-4 py-3
                               focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Select subcategory</option>
                      {subcategories.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Image
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="productImage"
                    />
                    <label
                      htmlFor="productImage"
                      className="cursor-pointer text-sm text-green-600 font-medium"
                    >
                      Click to upload image
                    </label>

                    {preview && (
                      <img
                        src={preview}
                        alt="Preview"
                        className="mx-auto mt-4 w-32 h-32 object-cover rounded-xl border"
                      />
                    )}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700
                           text-white font-semibold py-3 rounded-xl
                           transition disabled:opacity-50"
                >
                  {loading ? "Adding Product..." : "Add Product"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default AddProduct;
