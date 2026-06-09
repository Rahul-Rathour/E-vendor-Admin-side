import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [sortOption, setSortOption] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [viewProduct, setViewProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    qty: "",
    gst: "",
    video_link: "",
    product_type: "none"
  });

  const [previews, setPreviews] = useState({
    image: null, image2: null, image3: null, image4: null,
  });

  const [colors, setColors] = useState([]);

  // Fetch Data
  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSubcategories();
  }, [formData.category_id]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("products", { headers: { Authorization: `Bearer ${token}` } });
      setProducts(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("categories", { headers: { Authorization: `Bearer ${token}` } });
      setCategories(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchSubcategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("subcategories", { headers: { Authorization: `Bearer ${token}` } });
      const filtered = res.data.data.filter(
          (sub) => sub.category_id === parseInt(formData.category_id)
        );
      setSubcategories(filtered);
    } catch (err) { console.error(err); }
  };

  // Open Edit
  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      qty: product.qty || "",
      gst: product.gst || "",
      video_link: product.video_link || "",
      product_type: product.product_type || "none",
    });

    setPreviews({
      image: product.image ? `${process.env.REACT_APP_API_URL}/public/${product.image}` : null,
      image2: product.image2 ? `${process.env.REACT_APP_API_URL}/public/${product.image2}` : null,
      image3: product.image3 ? `${process.env.REACT_APP_API_URL}/public/${product.image3}` : null,
      image4: product.image4 ? `${process.env.REACT_APP_API_URL}/public/${product.image4}` : null,
    });

    // Load existing colors & sizes
    setColors(product.colors?.map(c => ({
      id: c.id,
      name: c.color_name,
      code: c.color_code || "",
      images: [],
      sizes: c.sizes?.map(s => ({
        id: s.id,
        size: s.size,
        qty: s.qty
      })) || []
    })) || []);
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, [key]: file }));
      setPreviews(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  // Update Product
  const handleUpdate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const fd = new FormData();

    Object.keys(formData).forEach(key => fd.append(key, formData[key]));

    // Main Images
    ['image', 'image2', 'image3', 'image4'].forEach(key => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    // Colors
    colors.forEach((color, i) => {
      if (color.id) fd.append(`colors[${i}][id]`, color.id);
      fd.append(`colors[${i}][name]`, color.name);
      fd.append(`colors[${i}][code]`, color.code || "");

      color.images.forEach((img, idx) => {
        fd.append(`colors[${i}][images][${idx}]`, img);
      });

      color.sizes.forEach((size, idx) => {
        if (size.id) fd.append(`colors[${i}][sizes][${idx}][id]`, size.id);
        fd.append(`colors[${i}][sizes][${idx}][size]`, size.size);
        fd.append(`colors[${i}][sizes][${idx}][qty]`, size.qty || 0);
      });
    });

    try {
      await api.post(`update-product/${editingProduct.id}`, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      setColors([]);
      fetchProducts();
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors || {};
        Object.values(errors).forEach(arr => toast.error(arr[0]));
      } else {
        toast.error(err.response?.data?.message || "Update failed");
      }
    }
  };

  // Color Handlers
  const addColor = () => {
    setColors([...colors, { id: null, name: "", code: "", images: [], sizes: [{ id: null, size: "", qty: "" }] }]);
  };

  const handleColorChange = (index, field, value) => {
    const updated = [...colors];
    updated[index][field] = value;
    setColors(updated);
  };

  const handleColorImageChange = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    const updated = [...colors];
    updated[colorIndex].images.push(...files);
    setColors(updated);
  };

  const addColorSize = (colorIndex) => {
    const updated = [...colors];
    updated[colorIndex].sizes.push({ id: null, size: "", qty: "" });
    setColors(updated);
  };

  const handleColorSizeChange = (colorIndex, sizeIndex, field, value) => {
    const updated = [...colors];
    updated[colorIndex].sizes[sizeIndex][field] = value;
    setColors(updated);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`delete-product/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success("Product deleted!");
      fetchProducts();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Filters & Pagination
  const filteredProducts = products
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => !categoryFilter || p.category_id == categoryFilter)
    .filter(p => {
      if (!stockFilter) return true;
      return stockFilter === "instock" ? p.qty > 0 : p.qty === 0;
    });

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="transition-all duration-300 px-6 py-8">
        <h2 className="text-3xl font-semibold text-gray-800 mb-8 text-center">Manage Products</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
          <div className="flex gap-3 flex-wrap">
            <select value={entriesToShow} onChange={(e) => { setEntriesToShow(Number(e.target.value)); setPage(1); }} className="border px-4 py-2 rounded-lg">
              <option value="10">Show 10</option>
              <option value="20">Show 20</option>
              <option value="50">Show 50</option>
            </select>

            <select onChange={(e) => setCategoryFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
              <option value="">All Categories</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>

            <select onChange={(e) => setStockFilter(e.target.value)} className="border px-4 py-2 rounded-lg">
              <option value="">All Status</option>
              <option value="instock">In Stock</option>
              <option value="outstock">Out of Stock</option>
            </select>

            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="border px-4 py-2 rounded-lg">
              <option value="">Sort By</option>
              <option value="name">Name (A–Z)</option>
              <option value="price_low">Price Low → High</option>
              <option value="price_high">Price High → Low</option>
              <option value="qty">Quantity High → Low</option>
              <option value="date">Newest First</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border rounded-lg w-80"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100 text-gray-600">
                <th className="p-4 text-left">Product</th>
                <th className="p-4 text-left">ID</th>
                <th className="p-4 text-left">Price</th>
                <th className="p-4 text-left">Qty</th>
                <th className="p-4 text-left">Stock</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(prod => (
                <tr key={prod.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <img src={prod.image ? `${process.env.REACT_APP_API_URL}/public/${prod.image}` : "/placeholder.jpg"} className="w-12 h-12 rounded-lg object-cover" alt="" />
                    <span className="font-medium">{prod.name}</span>
                  </td>
                  <td className="p-4">#{prod.id}</td>
                  <td className="p-4 font-semibold">₹{prod.price}</td>
                  <td className="p-4">{prod.qty}</td>
                  <td className="p-4">
                    {prod.qty > 0 ? <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">In Stock</span> : <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">Out</span>}
                  </td>
                  <td className="p-4 text-center flex justify-center gap-4">
                    <button onClick={() => setViewProduct(prod)} title="View">👁</button>
                    <button onClick={() => handleEdit(prod)} title="Edit" className="text-blue-600">✏️</button>
                    <button onClick={() => handleDelete(prod.id)} title="Delete" className="text-red-600">🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end mt-6 gap-4">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-4 py-2 border rounded">Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-4 py-2 border rounded">Next</button>
        </div>
      </div>

      {/* ==================== EDIT MODAL (Full Support) ==================== */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-5 rounded-t-3xl">
              <h3 className="text-2xl font-bold">Edit Product #{editingProduct.id}</h3>
            </div>

            <form onSubmit={handleUpdate} className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-80px)]">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="border rounded-xl px-4 py-3" placeholder="Product Name" required />
                <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="border rounded-xl px-4 py-3" placeholder="Price" required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <input type="number" value={formData.qty} onChange={(e) => setFormData({ ...formData, qty: e.target.value })} className="border rounded-xl px-4 py-3" placeholder="Quantity" />
                <input type="number" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} className="border rounded-xl px-4 py-3" placeholder="GST %" />
                <input type="text" value={formData.video_link} onChange={(e) => setFormData({ ...formData, video_link: e.target.value })} className="border rounded-xl px-4 py-3" placeholder="Video Link" />
              </div>

              <ReactQuill theme="snow" value={formData.description} onChange={(val) => setFormData({ ...formData, description: val })} className="border rounded-2xl" />

              {/* Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <select value={formData.category_id} onChange={(e) => setFormData({ ...formData, category_id: e.target.value })} className="border rounded-xl px-4 py-3">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <select value={formData.subcategory_id} onChange={(e) => setFormData({ ...formData, subcategory_id: e.target.value })} className="border rounded-xl px-4 py-3">
                  <option value="">Select Subcategory</option>
                  {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select value={formData.product_type} onChange={(e) => setFormData({ ...formData, product_type: e.target.value })} className="border rounded-xl px-4 py-3">
                  <option value="none">None</option>
                  <option value="new">New Arrival</option>
                  <option value="special_offer">Special Offer</option>
                  <option value="hot_deal">Hot Deal</option>
                </select>
              </div>

              {/* Main Images */}
              <div>
                <h3 className="font-semibold mb-3">Main Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {["image", "image2", "image3", "image4"].map((key, i) => (
                    <div key={i}>
                      <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, key)} />
                      {previews[key] && <img src={previews[key]} className="mt-2 w-24 h-24 object-cover rounded-xl" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Colors Section */}
              <div className="border border-orange-200 bg-orange-50 p-6 rounded-3xl">
                <h3 className="text-xl font-semibold mb-4">Colors & Sizes</h3>
                {colors.map((color, cIndex) => (
                  <div key={cIndex} className="bg-white p-5 rounded-2xl mb-6 border">
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" value={color.name} onChange={(e) => handleColorChange(cIndex, "name", e.target.value)} placeholder="Color Name" className="border rounded-xl px-4 py-3" required />
                      <input type="text" value={color.code} onChange={(e) => handleColorChange(cIndex, "code", e.target.value)} placeholder="#FF0000" className="border rounded-xl px-4 py-3" />
                    </div>

                    <div className="mt-4">
                      <input type="file" multiple accept="image/*" onChange={(e) => handleColorImageChange(e, cIndex)} />
                    </div>

                    <div className="mt-5">
                      <h4 className="font-medium mb-2">Sizes</h4>
                      {color.sizes.map((s, sIndex) => (
                        <div key={sIndex} className="flex gap-4 mb-3">
                          <input type="text" value={s.size} onChange={(e) => handleColorSizeChange(cIndex, sIndex, "size", e.target.value)} placeholder="Size" className="border rounded-xl px-4 py-3 w-1/2" />
                          <input type="number" value={s.qty} onChange={(e) => handleColorSizeChange(cIndex, sIndex, "qty", e.target.value)} placeholder="Qty" className="border rounded-xl px-4 py-3 w-1/2" />
                        </div>
                      ))}
                      <button type="button" onClick={() => addColorSize(cIndex)} className="text-blue-600 text-sm">+ Add Size</button>
                    </div>
                  </div>
                ))}

                <button type="button" onClick={addColor} className="w-full py-4 border-2 border-dashed border-orange-300 rounded-2xl text-orange-600 hover:bg-orange-100">
                  + Add New Color
                </button>
              </div>

              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => { setEditingProduct(null); setColors([]); }} className="px-6 py-3 border rounded-xl">Cancel</button>
                <button type="submit" className="px-8 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6">
            <h3 className="text-xl font-bold mb-4">{viewProduct.name}</h3>
            <p className="text-2xl font-semibold text-orange-600">₹{viewProduct.price}</p>
            <div dangerouslySetInnerHTML={{ __html: viewProduct.description }} className="mt-4" />
            <div className="flex justify-end mt-6">
              <button onClick={() => setViewProduct(null)} className="px-6 py-3 border rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;