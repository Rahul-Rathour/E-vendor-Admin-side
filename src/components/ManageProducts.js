import React, { useEffect, useState } from "react";
import api from "../api";
import SidebarMenu from "./SidebarMenu";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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



  // Filter products by name (case-insensitive)
  const filteredProducts = products.filter((prod) =>
    prod.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
    <div className="min-h-screen bg-gray-50">
      <SidebarMenu onToggle={(open) => setSidebarOpen(open)} />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-16"
          } px-6 py-8`}
      >
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Manage Products
        </h2>
        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <input
            type="text"
            placeholder="Search product by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300
                       focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Message */}
        {message && (
          <p className="text-center text-green-600 mb-4">{message}</p>
        )}

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500">
            No products available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((prod) => {
              const categoryName =
                categories.find((c) => c.id === prod.category_id)?.name ||
                "Uncategorized";

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-2xl border border-gray-200
                           shadow-sm hover:shadow-xl transition-all"
                >
                  {/* Image */}
                  <div className="h-56 bg-gray-100 flex items-center justify-center">
                    <img
                      src={
                        prod.image
                          ? `${process.env.REACT_APP_API_URL}/public/${prod.image}`
                          : "/placeholder.jpg"
                      }
                      alt={prod.name}
                      className="h-full object-contain"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full">
                      {categoryName}
                    </span>

                    <h3 className="mt-2 text-lg font-semibold text-gray-800">
                      {prod.name}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="mt-4 text-xl font-bold text-gray-900">
                      ₹{prod.price}
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleEdit(prod)}
                        className="flex-1 border border-blue-500 text-blue-600
                                 py-2 rounded-lg hover:bg-blue-50"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="flex-1 border border-red-500 text-red-600
                                 py-2 rounded-lg hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Edit Product
            </h3>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Product Name"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                required
              />

              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Price"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                required
              />

              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description"
                rows="3"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
              />

              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <input type="file" onChange={handleImageChange} />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg mt-2"
                />
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* =============== END EDIT MODAL =============== */}
    </div>
  );

};

export default ManageProducts;
