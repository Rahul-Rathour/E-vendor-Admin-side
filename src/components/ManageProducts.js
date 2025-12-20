import React, { useEffect, useState } from "react";
import api from "../api";
import SidebarMenu from "./SidebarMenu";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ✅ Fetch all categories for dropdown
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

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // ✅ Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  // ✅ Open edit form
  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category_id,
    });
    setPreview(
      product.image
        ? `${process.env.REACT_APP_API_URL}/public/${product.image}`
        : null
    );
  };

  // ✅ Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price);
    form.append("description", formData.description);
    form.append("category_id", formData.category_id);
    if (image) form.append("image", image);

    try {
      await api.post(`update-product/${editingProduct.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setMessage("Product updated successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);
      setMessage("Failed to update product.");
    }
  };

  // ✅ Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("token");
    try {
      await api.delete(`delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Product deleted successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
      setMessage("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <SidebarMenu onToggle={(open) => setSidebarOpen(open)} />
      <div
        className={`
        flex-1 transition-all duration-300
        ${sidebarOpen ? "ml-64" : "ml-16"}
        py-10 px-4 sm:px-6 lg:px-10
      `}
      >
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">
          Manage Products
        </h2>

        {message && (
          <div className="text-center mb-4 text-green-600 font-medium">
            {message}
          </div>
        )}

        {/* Product List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white shadow-md p-4 rounded-xl border border-gray-200 flex flex-col items-center"
            >
              <img
                src={
                  prod.image
                    ? `${process.env.REACT_APP_API_URL}/public/${prod.image}`
                    : "/placeholder.jpg"
                }
                alt={prod.name}
                className="w-24 h-24 object-cover rounded-lg mb-3"
              />
              <h3 className="text-lg font-semibold">{prod.name}</h3>
              <p className="text-gray-500 text-sm mb-1">
                ₹{prod.price} —{" "}
                {
                  categories.find((cat) => cat.id === prod.category_id)?.name ||
                  "Unknown Category"
                }
              </p>
              <p className="text-gray-500 text-sm">{prod.description}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleEdit(prod)}
                  className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(prod.id)}
                  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-semibold mb-4 text-center text-green-700">
                Edit Product
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Product name"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Price"
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Product description"
                  className="w-full border px-3 py-2 rounded"
                ></textarea>

                {/* Category Dropdown */}
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                {/* Image Upload */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-32 h-32 object-cover mt-2 rounded"
                  />
                )}

                <div className="flex justify-between mt-4">
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageProducts;
