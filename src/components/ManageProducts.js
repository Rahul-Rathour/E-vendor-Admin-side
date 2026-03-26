import React, { useEffect, useState } from "react";
import api from "../api";
import SidebarMenu from "./SidebarMenu";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [sortOption, setSortOption] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [viewProduct, setViewProduct] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const quillModules = {
    toolbar: [
      [{ list: "ordered" }, { list: "bullet" }],
      ["bold", "italic", "underline"],
      ["link"],
      [{ header: [1, 2, false] }],
      ["clean"],
    ],
  };

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    qty: "",
    gst: "",
    video_link: "",
    product_type: "none",

    image: null,
    image2: null,
    image3: null,
    image4: null
  });

  const [previews, setPreviews] = useState({
    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  // Fetch products
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

  // Fetch categories
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

  // Fetch subcategories
  const fetchSubcategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("subcategories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubcategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, []);

  // Filter products
  const filteredProducts = products
    .filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => (categoryFilter ? p.category_id == categoryFilter : true))
    .filter(p => {
      if (!stockFilter) return true;
      return stockFilter === "instock" ? p.qty > 0 : p.qty === 0;
    });


  // sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "name") return a.name.localeCompare(b.name);
    if (sortOption === "price_low") return a.price - b.price;
    if (sortOption === "price_high") return b.price - a.price;
    if (sortOption === "qty") return b.qty - a.qty;
    if (sortOption === "date") return new Date(b.created_at) - new Date(a.created_at);
    return 0;
  });

  const totalPages = Math.ceil(sortedProducts.length / entriesToShow);
  const startIndex = (page - 1) * entriesToShow;
  const paginatedProducts = sortedProducts.slice(startIndex, startIndex + entriesToShow);


  // Handle form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle image uploads
  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    setFormData({ ...formData, [field]: file });

    if (file) {
      setPreviews((prev) => ({
        ...prev,
        [field]: URL.createObjectURL(file),
      }));
    }
  };


  // Edit button clicked
  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      category_id: product.category_id,
      subcategory_id: product.subcategory_id || "",
      qty: product.qty || "",
      gst: product.gst || "",
      video_link: product.video_link || "",
      product_type: product.product_type || "none",

      image: null,
      image2: null,
      image3: null,
      image4: null
    });

    setPreviews({
      image: product.image ? `${process.env.REACT_APP_API_URL}/public/${product.image}` : null,
      image2: product.image2 ? `${process.env.REACT_APP_API_URL}/public/${product.image2}` : null,
      image3: product.image3 ? `${process.env.REACT_APP_API_URL}/public/${product.image3}` : null,
      image4: product.image4 ? `${process.env.REACT_APP_API_URL}/public/${product.image4}` : null,
    });

  };

  // Update product
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const form = new FormData();
    form.append("name", formData.name);
    form.append("price", formData.price);
    form.append("description", formData.description);
    form.append("category_id", formData.category_id);
    form.append("subcategory_id", formData.subcategory_id);
    form.append("qty", formData.qty);
    form.append("gst", formData.gst);
    form.append("video_link", formData.video_link);
    form.append("product_type", formData.product_type);

    if (formData.image) form.append("image", formData.image);
    if (formData.image2) form.append("image2", formData.image2);
    if (formData.image3) form.append("image3", formData.image3);
    if (formData.image4) form.append("image4", formData.image4);

    try {
      await api.post(`update-product/${editingProduct.id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (err) {
      console.error("Error updating product:", err);

      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        Object.values(errors).forEach((msg) => toast.error(msg[0]));
        return;
      }

      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  // Delete product
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const token = localStorage.getItem("token");

    try {
      await api.delete(`delete-product/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product deleted!");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

      <div className={`transition-all duration-300 px-6 py-8`}>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Manage Products
        </h2>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          {/* <input
            type="text"
            placeholder="Search product by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
          /> */}
        </div>

        {/* Product list */}
        {/* --- Filters Row --- */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex gap-3">
            {/* Entries selector */}
            <select
              value={entriesToShow}
              onChange={(e) => {
                setEntriesToShow(Number(e.target.value));
                setPage(1);
              }}
              className="border px-3 py-2 rounded"
            >
              <option value="10">Show 10</option>
              <option value="20">Show 20</option>
              <option value="50">Show 50</option>
            </select>
            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              onChange={(e) => setStockFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="instock">In Stock</option>
              <option value="outstock">Out of Stock</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Sort By</option>
              <option value="name">Name (A–Z)</option>
              <option value="price_low">Price: Low → High</option>
              <option value="price_high">Price: High → Low</option>
              <option value="qty">Quantity (High → Low)</option>
              <option value="date">Newest First</option>
            </select>

          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-64"
          />
        </div>

        {/* --- Product Table --- */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">Product ID</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Quantity</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedProducts.map((prod) => {
                const inStock = prod.qty > 0;

                return (
                  <tr key={prod.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={
                          prod.image
                            ? `${process.env.REACT_APP_API_URL}/public/${prod.image}`
                            : "/placeholder.jpg"
                        }
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="font-medium">{prod.name}</span>
                    </td>

                    <td className="p-4 text-gray-600">#{prod.id}</td>

                    <td className="p-4 font-semibold">₹{prod.price}</td>

                    <td className="p-4">{prod.qty}</td>

                    <td className="p-4">
                      {inStock ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          In Stock
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td className="p-4 flex gap-3">
                      {/* VIEW */}
                      <button
                        onClick={() => setViewProduct(prod)}
                        className="text-yellow-500 text-xl"
                        title="View"
                      >
                        👁
                      </button>

                      {/* EDIT */}
                      <button
                        onClick={() => handleEdit(prod)}
                        className="text-blue-600 text-xl"
                        title="Edit"
                      >
                        ✏️
                      </button>

                      {/* DELETE */}
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="text-red-600 text-xl"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* --- Pagination --- */}
        <div className="flex justify-end mt-6 items-center gap-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Prev
          </button>

          <span className="font-medium">Page {page} of {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border rounded-lg disabled:opacity-40"
          >
            Next
          </button>
        </div>

      </div>

      {/* ---------------- EDIT MODAL ---------------- */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit Product</h3>

            <form onSubmit={handleUpdate} className="space-y-4">

              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border px-4 py-2 rounded" required />

              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border px-4 py-2 rounded" required />

              <input type="number" name="qty" value={formData.qty} onChange={handleChange} placeholder="Quantity" className="w-full border px-4 py-2 rounded" />

              <input type="number" name="gst" value={formData.gst} onChange={handleChange} placeholder="GST %" className="w-full border px-4 py-2 rounded" />

              <label className="block font-medium">Description</label>
              <ReactQuill
                key={editingProduct?.id}  // ← IMPORTANT FIX
                theme="snow"
                modules={quillModules}
                value={formData.description}
                onChange={(value) =>
                  setFormData({ ...formData, description: value })
                }
                className="bg-white mb-4"
                style={{ height: "180px", marginBottom: "50px" }}
              />

              <label className="block mt-2 font-medium">Live Preview:</label>
              <div
                className="border rounded p-3 bg-gray-50"
                dangerouslySetInnerHTML={{ __html: formData.description }}
              ></div>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border px-4 py-2 rounded">
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select name="subcategory_id" value={formData.subcategory_id} onChange={handleChange} className="w-full border px-4 py-2 rounded">
                <option value="">Select Subcategory</option>
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>

              <select name="product_type" value={formData.product_type} onChange={handleChange} className="w-full border px-4 py-2 rounded">
                <option value="none">None</option>
                <option value="new">New</option>
                <option value="special_offer">Special Offer</option>
                <option value="hot_deal">Hot Deal</option>
              </select>

              <input type="text" name="video_link" value={formData.video_link} onChange={handleChange} placeholder="Video Link" className="w-full border px-4 py-2 rounded" />

              {/* 4 images */}
              <div className="grid grid-cols-2 gap-4">
                <input type="file" onChange={(e) => handleImageChange(e, "image")} />
                <input type="file" onChange={(e) => handleImageChange(e, "image2")} />
                <input type="file" onChange={(e) => handleImageChange(e, "image3")} />
                <input type="file" onChange={(e) => handleImageChange(e, "image4")} />
              </div>

              <div className="grid grid-cols-4 gap-3 mt-3">
                {previews.image && (
                  <img src={previews.image} className="w-20 h-20 rounded-lg object-cover" />
                )}
                {previews.image2 && (
                  <img src={previews.image2} className="w-20 h-20 rounded-lg object-cover" />
                )}
                {previews.image3 && (
                  <img src={previews.image3} className="w-20 h-20 rounded-lg object-cover" />
                )}
                {previews.image4 && (
                  <img src={previews.image4} className="w-20 h-20 rounded-lg object-cover" />
                )}
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- VIEW MODAL ---------------- */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <h3 className="text-xl font-semibold mb-4">Product Details</h3>

            <div className="space-y-3">

              <h2 className="text-lg font-bold">{viewProduct.name}</h2>

              <p><strong>Price:</strong> ₹{viewProduct.price}</p>
              <p><strong>Quantity:</strong> {viewProduct.qty}</p>

              <p>
                <strong>Description:</strong>
                <div
                  className="p-3 border rounded bg-gray-50 mt-1"
                  dangerouslySetInnerHTML={{ __html: viewProduct.description }}
                />
              </p>

              <div>
                <strong>Images:</strong>
                <div className="grid grid-cols-4 gap-3 mt-2">
                  {viewProduct.image && (
                    <img src={`${process.env.REACT_APP_API_URL}/public/${viewProduct.image}`} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  {viewProduct.image2 && (
                    <img src={`${process.env.REACT_APP_API_URL}/public/${viewProduct.image2}`} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  {viewProduct.image3 && (
                    <img src={`${process.env.REACT_APP_API_URL}/public/${viewProduct.image3}`} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                  {viewProduct.image4 && (
                    <img src={`${process.env.REACT_APP_API_URL}/public/${viewProduct.image4}`} className="w-20 h-20 rounded-lg object-cover" />
                  )}
                </div>
              </div>

            </div>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setViewProduct(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
