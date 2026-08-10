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

  // =========================
  // FORM DATA
  // =========================
  const [formData, setFormData] = useState({
    name: "",
    article_number: "",
    hsn: "",
    price: "",
    wholesale_price: "",
    description: "",
    specification: "",
    manufacturing_details: "",
    category_id: "",
    subcategory_id: "",
    qty: "",
    gst: "",
    video_link: "",
    return_days: "",
    product_type: "none",

    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  // =========================
  // MAIN IMAGE PREVIEWS
  // =========================
  const [previews, setPreviews] = useState({
    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  // =========================
  // COLORS
  // =========================
  const [colors, setColors] = useState([]);

  // =========================
  // FETCH DATA
  // =========================
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetchSubcategories(formData.category_id);
    } else {
      setSubcategories([]);
    }
  }, [formData.category_id]);

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProducts(res.data.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("Failed to load products");
    }
  };

  // =========================
  // FETCH CATEGORIES
  // =========================
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // =========================
  // FETCH SUBCATEGORIES
  // =========================
  const fetchSubcategories = async (categoryId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("subcategories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const allSubcategories = res.data.data || [];

      const filtered = allSubcategories.filter(
        (sub) => Number(sub.category_id) === Number(categoryId)
      );

      setSubcategories(filtered);
    } catch (err) {
      console.error("Error fetching subcategories:", err);
    }
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      article_number: product.article_number || "",
      hsn: product.hsn || "",
      price: product.price || "",
      wholesale_price: product.wholesale_price || "",
      description: product.description || "",
      specification: product.specification || "",
      manufacturing_details: product.manufacturing_details || "",
      category_id: product.category_id || "",
      subcategory_id: product.subcategory_id || "",
      qty: product.qty ?? "",
      gst: product.gst ?? "",
      video_link: product.video_link || "",
      return_days: product.return_days ?? "",
      product_type: product.product_type || "none",

      // IMPORTANT:
      // Load existing status from database
      // 1 = Available
      // 0 = Not Available
      status: Number(product.status) === 1 ? 1 : 0,

      image: null,
      image2: null,
      image3: null,
      image4: null,
    });

    setPreviews({
      image: product.image
        ? `${process.env.REACT_APP_API_URL}/public/${product.image}`
        : null,

      image2: product.image2
        ? `${process.env.REACT_APP_API_URL}/public/${product.image2}`
        : null,

      image3: product.image3
        ? `${process.env.REACT_APP_API_URL}/public/${product.image3}`
        : null,

      image4: product.image4
        ? `${process.env.REACT_APP_API_URL}/public/${product.image4}`
        : null,
    });

    // =========================
    // LOAD COLORS + SIZES
    // =========================
    setColors(
      product.colors?.map((color) => ({
        id: color.id,
        name: color.color_name || "",
        code: color.color_code || "",

        // New images selected by admin
        images: [],

        // Existing color images
        existingImages:
          color.images?.map((img) => ({
            id: img.id,
            image_path: img.image_path,
          })) || [],

        sizes:
          color.sizes?.map((size) => ({
            id: size.id,
            size: size.size || "",
            qty: size.qty ?? 0,
          })) || [],
      })) || []
    );
  };

  // =========================
  // MAIN IMAGE CHANGE
  // =========================
  const handleImageChange = (e, key) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setFormData((prev) => ({
      ...prev,
      [key]: file,
    }));

    setPreviews((prev) => ({
      ...prev,
      [key]: URL.createObjectURL(file),
    }));
  };

  // =========================
  // UPDATE PRODUCT
  // =========================
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!editingProduct) return;

    const token = localStorage.getItem("token");

    const fd = new FormData();

    // =========================
    // BASIC PRODUCT FIELDS
    // =========================
    fd.append("name", formData.name);
    fd.append("article_number", formData.article_number);
    fd.append("hsn", formData.hsn);
    fd.append("price", formData.price);

    if (formData.wholesale_price !== "") {
      fd.append("wholesale_price", formData.wholesale_price);
    }

    fd.append("description", formData.description || "");
    fd.append("specification", formData.specification || "");
    fd.append(
      "manufacturing_details",
      formData.manufacturing_details || ""
    );

    if (formData.category_id) {
      fd.append("category_id", formData.category_id);
    }

    if (formData.subcategory_id) {
      fd.append("subcategory_id", formData.subcategory_id);
    }

    if (formData.qty !== "") {
      fd.append("qty", formData.qty);
    }

    if (formData.gst !== "") {
      fd.append("gst", formData.gst);
    }

    if (formData.video_link) {
      fd.append("video_link", formData.video_link);
    }

    if (formData.return_days !== "") {
      fd.append("return_days", formData.return_days);
    }

    fd.append("product_type", formData.product_type || "none");
    // =========================
    // PRODUCT AVAILABILITY STATUS
    // 1 = Available
    // 0 = Not Available
    // =========================
    fd.append("status", formData.status ? 1 : 0);

    // =========================
    // MAIN IMAGES
    // Only send newly selected images
    // =========================
    ["image", "image2", "image3", "image4"].forEach((key) => {
      if (formData[key] instanceof File) {
        fd.append(key, formData[key]);
      }
    });

    // =========================
    // COLORS
    // =========================
    colors.forEach((color, colorIndex) => {
      // Existing color ID
      if (color.id) {
        fd.append(
          `colors[${colorIndex}][id]`,
          color.id
        );
      }

      // Color name
      fd.append(
        `colors[${colorIndex}][name]`,
        color.name || ""
      );

      // Color code
      fd.append(
        `colors[${colorIndex}][code]`,
        color.code || ""
      );

      // =========================
      // NEW COLOR IMAGES
      // =========================
      if (color.images?.length > 0) {
        color.images.forEach((image, imageIndex) => {
          fd.append(
            `colors[${colorIndex}][images][${imageIndex}]`,
            image
          );
        });
      }

      // =========================
      // SIZES
      // =========================
      color.sizes?.forEach((size, sizeIndex) => {
        if (size.id) {
          fd.append(
            `colors[${colorIndex}][sizes][${sizeIndex}][id]`,
            size.id
          );
        }

        fd.append(
          `colors[${colorIndex}][sizes][${sizeIndex}][size]`,
          size.size || ""
        );

        fd.append(
          `colors[${colorIndex}][sizes][${sizeIndex}][qty]`,
          size.qty ?? 0
        );
      });
    });

    try {
      const response = await api.post(
        `update-product/${editingProduct.id}`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status) {
        toast.success(
          response.data.message || "Product updated successfully!"
        );

        setEditingProduct(null);
        setColors([]);

        setFormData({
          name: "",
          article_number: "",
          hsn: "",
          price: "",
          wholesale_price: "",
          description: "",
          specification: "",
          manufacturing_details: "",
          category_id: "",
          subcategory_id: "",
          qty: "",
          gst: "",
          video_link: "",
          return_days: "",
          product_type: "none",
          image: null,
          image2: null,
          image3: null,
          image4: null,
        });

        setPreviews({
          image: null,
          image2: null,
          image3: null,
          image4: null,
        });

        fetchProducts();
      }
    } catch (err) {
      console.error("Update product error:", err);

      if (err.response?.status === 422) {
        const errors = err.response?.data?.errors || {};

        Object.values(errors).forEach((messages) => {
          if (Array.isArray(messages)) {
            messages.forEach((message) => {
              toast.error(message);
            });
          }
        });
      } else {
        toast.error(
          err.response?.data?.message ||
          "Failed to update product"
        );
      }
    }
  };

  // =========================
  // ADD NEW COLOR
  // =========================
  const addColor = () => {
    setColors((prev) => [
      ...prev,
      {
        id: null,
        name: "",
        code: "",
        images: [],
        existingImages: [],
        sizes: [
          {
            id: null,
            size: "",
            qty: "",
          },
        ],
      },
    ]);
  };

  // =========================
  // COLOR FIELD CHANGE
  // =========================
  const handleColorChange = (index, field, value) => {
    setColors((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });
  };

  // =========================
  // COLOR IMAGE CHANGE
  // =========================
  const handleColorImageChange = (e, colorIndex) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    setColors((prev) => {
      const updated = [...prev];

      updated[colorIndex] = {
        ...updated[colorIndex],
        images: [
          ...(updated[colorIndex].images || []),
          ...files,
        ],
      };

      return updated;
    });
  };

  // =========================
  // ADD SIZE
  // =========================
  const addColorSize = (colorIndex) => {
    setColors((prev) => {
      const updated = [...prev];

      updated[colorIndex] = {
        ...updated[colorIndex],
        sizes: [
          ...(updated[colorIndex].sizes || []),
          {
            id: null,
            size: "",
            qty: "",
          },
        ],
      };

      return updated;
    });
  };

  // =========================
  // SIZE CHANGE
  // =========================
  const handleColorSizeChange = (
    colorIndex,
    sizeIndex,
    field,
    value
  ) => {
    setColors((prev) => {
      const updated = [...prev];

      const sizes = [...updated[colorIndex].sizes];

      sizes[sizeIndex] = {
        ...sizes[sizeIndex],
        [field]: value,
      };

      updated[colorIndex] = {
        ...updated[colorIndex],
        sizes,
      };

      return updated;
    });
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`delete-product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product deleted!");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  // =========================
  // FILTERS
  // =========================
  const filteredProducts = products
    .filter((product) =>
      product.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(
      (product) =>
        !categoryFilter ||
        product.category_id == categoryFilter
    )
    .filter((product) => {
      if (!stockFilter) return true;

      return stockFilter === "instock"
        ? product.qty > 0
        : product.qty === 0;
    });

  // =========================
  // SORT
  // =========================
  const sortedProducts = [...filteredProducts].sort(
    (a, b) => {
      if (sortOption === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }

      if (sortOption === "price_low") {
        return Number(a.price) - Number(b.price);
      }

      if (sortOption === "price_high") {
        return Number(b.price) - Number(a.price);
      }

      if (sortOption === "qty") {
        return Number(b.qty) - Number(a.qty);
      }

      if (sortOption === "date") {
        return (
          new Date(b.created_at) -
          new Date(a.created_at)
        );
      }

      return 0;
    }
  );

  // =========================
  // PAGINATION
  // =========================
  const totalPages = Math.ceil(
    sortedProducts.length / entriesToShow
  );

  const startIndex =
    (page - 1) * entriesToShow;

  const paginatedProducts =
    sortedProducts.slice(
      startIndex,
      startIndex + entriesToShow
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="transition-all duration-300 px-6 py-8">

        {/* ==================== HEADER ==================== */}
        <div className="mb-8">
          <h2 className="text-3xl font-semibold text-gray-800">
            Manage Products
          </h2>

          <p className="text-gray-500 mt-1">
            Manage product details, images, colors, sizes and stock.
          </p>
        </div>

        {/* ==================== FILTERS ==================== */}
        <div className="flex flex-wrap items-center justify-between mb-6 gap-4">

          <div className="flex gap-3 flex-wrap">

            <select
              value={entriesToShow}
              onChange={(e) => {
                setEntriesToShow(
                  Number(e.target.value)
                );
                setPage(1);
              }}
              className="border border-gray-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="10">
                Show 10
              </option>

              <option value="20">
                Show 20
              </option>

              <option value="50">
                Show 50
              </option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">
                All Categories
              </option>

              {categories.map((cat) => (
                <option
                  key={cat.id}
                  value={cat.id}
                >
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setPage(1);
              }}
              className="border border-gray-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">
                All Status
              </option>

              <option value="instock">
                In Stock
              </option>

              <option value="outstock">
                Out of Stock
              </option>
            </select>

            <select
              value={sortOption}
              onChange={(e) =>
                setSortOption(e.target.value)
              }
              className="border border-gray-300 px-4 py-2.5 rounded-xl bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">
                Sort By
              </option>

              <option value="name">
                Name (A–Z)
              </option>

              <option value="price_low">
                Price Low → High
              </option>

              <option value="price_high">
                Price High → Low
              </option>

              <option value="qty">
                Quantity High → Low
              </option>

              <option value="date">
                Newest First
              </option>
            </select>

          </div>

          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2.5 border border-gray-300 rounded-xl w-80 bg-white focus:outline-none focus:border-orange-500"
          />

        </div>

        {/* ==================== TABLE ==================== */}
        <div className="overflow-x-auto bg-white rounded-2xl shadow">

          <table className="min-w-full">

            <thead>
              <tr className="bg-orange-50 text-gray-600">

                <th className="p-4 text-left">
                  Product
                </th>

                <th className="p-4 text-left">
                  ID
                </th>

                <th className="p-4 text-left">
                  Price
                </th>

                <th className="p-4 text-left">
                  Qty
                </th>

                <th className="p-4 text-left">
                  Stock
                </th>

                <th className="p-4 text-center">
                  Actions
                </th>

              </tr>
            </thead>

            <tbody>

              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((prod) => (

                  <tr
                    key={prod.id}
                    className="border-b hover:bg-orange-50 transition"
                  >

                    <td className="p-4 flex items-center gap-3">

                      <img
                        src={
                          prod.image
                            ? `${process.env.REACT_APP_API_URL}/public/${prod.image}`
                            : "/placeholder.jpg"
                        }
                        className="w-12 h-12 rounded-lg object-cover border"
                        alt={prod.name}
                      />

                      <span className="font-medium">
                        {prod.name}
                      </span>

                    </td>

                    <td className="p-4">
                      #{prod.id}
                    </td>

                    <td className="p-4 font-semibold">
                      ₹{prod.price}
                    </td>

                    <td className="p-4">
                      {prod.qty}
                    </td>

                    <td className="p-4">

                      {prod.qty > 0 ? (
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs">
                          Out
                        </span>
                      )}

                    </td>

                    <td className="p-4">

                      <div className="flex justify-center gap-4">

                        <button
                          onClick={() =>
                            setViewProduct(prod)
                          }
                          title="View"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          👁
                        </button>

                        <button
                          onClick={() =>
                            handleEdit(prod)
                          }
                          title="Edit"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(prod.id)
                          }
                          title="Delete"
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑
                        </button>

                      </div>

                    </td>

                  </tr>

                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-10 text-center text-gray-500"
                  >
                    No products found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>

        {/* ==================== PAGINATION ==================== */}
        <div className="flex justify-between items-center mt-6">

          <span className="text-sm text-gray-600">
            Showing{" "}
            {sortedProducts.length === 0
              ? 0
              : startIndex + 1}{" "}
            to{" "}
            {Math.min(
              startIndex + entriesToShow,
              sortedProducts.length
            )}{" "}
            of {sortedProducts.length} products
          </span>

          <div className="flex items-center gap-4">

            <button
              disabled={page === 1}
              onClick={() =>
                setPage((prev) => prev - 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
            >
              Prev
            </button>

            <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-xl">
              Page {page} of {totalPages || 1}
            </span>

            <button
              disabled={
                page === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setPage((prev) => prev + 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>

          </div>

        </div>
        {/* =========================================================
            EDIT PRODUCT MODAL
        ========================================================= */}
        {editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl max-h-[95vh] overflow-hidden">

              {/* ================= MODAL HEADER ================= */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-5 flex items-center justify-between">

                <div>
                  <h3 className="text-2xl font-bold">
                    Edit Product
                  </h3>

                  <p className="text-orange-100 text-sm mt-1">
                    Product ID: #{editingProduct.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setColors([]);
                  }}
                  className="text-white text-2xl hover:text-orange-100"
                >
                  ✕
                </button>

              </div>

              {/* ================= FORM ================= */}
              <form
                onSubmit={handleUpdate}
                className="p-8 space-y-8 overflow-y-auto max-h-[calc(95vh-90px)]"
              >

                {/* =====================================================
                    BASIC PRODUCT INFORMATION
                ===================================================== */}
                <div>

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800">
                      Basic Product Information
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Update the basic information of your product.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Product Name */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Name *
                      </label>

                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            name: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    {/* Article Number */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Article Number *
                      </label>

                      <input
                        type="text"
                        value={formData.article_number}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            article_number: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        placeholder="Enter article number"
                        required
                      />
                    </div>

                    {/* HSN */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        HSN Code *
                      </label>

                      <input
                        type="text"
                        value={formData.hsn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hsn: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        placeholder="Enter HSN code"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Selling Price *
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              price: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500"
                          placeholder="Enter selling price"
                          required
                        />
                      </div>
                    </div>

                    {/* Wholesale Price */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Wholesale Price
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.wholesale_price}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              wholesale_price: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl pl-9 pr-4 py-3 focus:outline-none focus:border-orange-500"
                          placeholder="Enter wholesale price"
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={formData.qty}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            qty: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        placeholder="Enter available quantity"
                      />
                    </div>

                    {/* GST */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        GST (%)
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.gst}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              gst: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-orange-500"
                          placeholder="Enter GST percentage"
                        />

                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    {/* Return Days */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Return Period (Days)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={formData.return_days}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            return_days: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                        placeholder="Example: 7"
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        Enter 0 if this product is non-returnable.
                      </p>
                    </div>

                  </div>

                </div>


                {/* =====================================================
                    CATEGORY & PRODUCT TYPE
                ===================================================== */}
                <div className="border-t pt-8">

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800">
                      Category & Product Type
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Select the category, subcategory and product type.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>

                      <select
                        value={formData.category_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category_id: e.target.value,
                            subcategory_id: "",
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">
                          Select Category
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subcategory */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Subcategory
                      </label>

                      <select
                        value={formData.subcategory_id}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            subcategory_id: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">
                          Select Subcategory
                        </option>

                        {subcategories.map((subcategory) => (
                          <option
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Product Type */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Product Type
                      </label>

                      <select
                        value={formData.product_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            product_type: e.target.value,
                          })
                        }
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="none">
                          None
                        </option>

                        <option value="new">
                          New Arrival
                        </option>

                        <option value="special_offer">
                          Special Offer
                        </option>

                        <option value="hot_deal">
                          Hot Deal
                        </option>
                      </select>
                    </div>

                  </div>

                </div>


                {/* =====================================================
                    DESCRIPTION
                ===================================================== */}
                <div className="border-t pt-8">

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800">
                      Product Description
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Update the product description and other details.
                    </p>
                  </div>

                  {/* Description */}
                  <div className="mb-6">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>

                    <div className="border border-gray-300 rounded-2xl overflow-hidden">
                      <ReactQuill
                        theme="snow"
                        value={formData.description}
                        onChange={(value) =>
                          setFormData({
                            ...formData,
                            description: value,
                          })
                        }
                      />
                    </div>

                  </div>

                  {/* Specification */}
                  <div className="mb-6">

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Specification
                    </label>

                    <textarea
                      rows="5"
                      value={formData.specification}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          specification: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Enter product specifications"
                    />

                  </div>

                  {/* Manufacturing Details */}
                  <div>

                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Manufacturing Details
                    </label>

                    <textarea
                      rows="5"
                      value={formData.manufacturing_details}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufacturing_details:
                            e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 resize-none"
                      placeholder="Enter manufacturing details"
                    />

                  </div>

                </div>


                {/* =====================================================
                    VIDEO
                ===================================================== */}
                <div className="border-t pt-8">

                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Video Link
                  </label>

                  <input
                    type="url"
                    value={formData.video_link}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        video_link: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                    placeholder="https://www.youtube.com/..."
                  />

                  <p className="text-xs text-gray-500 mt-1">
                    Enter a valid video URL.
                  </p>

                </div>


                {/* =====================================================
                    MAIN PRODUCT IMAGES
                ===================================================== */}
                <div className="border-t pt-8">

                  <div className="mb-5">
                    <h3 className="text-xl font-bold text-gray-800">
                      Main Product Images
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Select a new image only if you want to replace the
                      existing image.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">

                    {[
                      {
                        key: "image",
                        label: "Main Image",
                      },
                      {
                        key: "image2",
                        label: "Image 2",
                      },
                      {
                        key: "image3",
                        label: "Image 3",
                      },
                      {
                        key: "image4",
                        label: "Image 4",
                      },
                    ].map((item) => (

                      <div
                        key={item.key}
                        className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
                      >

                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          {item.label}
                        </label>

                        {/* Preview */}
                        <div className="w-full h-36 bg-white rounded-xl border flex items-center justify-center overflow-hidden mb-3">

                          {previews[item.key] ? (
                            <img
                              src={previews[item.key]}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">
                              No Image
                            </span>
                          )}

                        </div>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) =>
                            handleImageChange(
                              e,
                              item.key
                            )
                          }
                          className="w-full text-sm"
                        />

                      </div>

                    ))}

                  </div>

                </div>


                {/* =====================================================
                    COLORS & SIZES
                ===================================================== */}
                <div className="border-t pt-8">

                  <div className="mb-5">

                    <h3 className="text-xl font-bold text-gray-800">
                      Colors & Sizes
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      Manage product colors, color images and available
                      sizes.
                    </p>

                  </div>

                  <div className="border border-orange-200 bg-orange-50 p-6 rounded-3xl">

                    {colors.length === 0 && (
                      <div className="bg-white border border-dashed border-orange-300 rounded-2xl p-8 text-center mb-5">

                        <p className="text-gray-500">
                          No colors added to this product.
                        </p>

                        <p className="text-sm text-gray-400 mt-1">
                          Click "Add New Color" below to add one.
                        </p>

                      </div>
                    )}

                    {colors.map((color, cIndex) => (

                      <div
                        key={cIndex}
                        className="bg-white p-6 rounded-2xl mb-6 border border-gray-200"
                      >

                        {/* ================= COLOR HEADER ================= */}

                        <div className="flex items-center justify-between mb-5">

                          <h4 className="text-lg font-bold text-gray-800">
                            Color {cIndex + 1}
                          </h4>

                          {color.id && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                              Existing Color #{color.id}
                            </span>
                          )}

                        </div>

                        {/* ================= COLOR NAME + CODE ================= */}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                          {/* Color Name */}
                          <div className="w-full">
                            <label className="block text-sm font-medium text-[#17365D] mb-2">
                              Color Name *
                            </label>

                            <input
                              type="text"
                              value={color.name}
                              onChange={(e) =>
                                handleColorChange(
                                  cIndex,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full h-[56px] border border-gray-300 rounded-[4px] px-4 focus:outline-none focus:border-blue-500"
                              placeholder="Example: Red"
                              required
                            />
                          </div>

                          {/* Color Code */}
                          <div className="w-full">
                            <label className="block text-sm font-medium text-[#17365D] mb-2">
                              Color Code *
                            </label>

                            <div className="h-[56px] w-full border border-gray-300 rounded-[4px] flex items-center px-3 gap-3">

                              {/* Color Picker */}
                              <input
                                type="color"
                                value={color.code || "#000000"}
                                onChange={(e) =>
                                  handleColorChange(
                                    cIndex,
                                    "code",
                                    e.target.value
                                  )
                                }
                                className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                              />

                              {/* Hex Code */}
                              <span className="text-sm text-gray-600 font-mono">
                                {color.code || "#000000"}
                              </span>

                            </div>
                          </div>

                        </div>

                        {/* =================================================
                            EXISTING COLOR IMAGES
                        ================================================= */}

                        {color.existingImages?.length > 0 && (

                          <div className="mt-6">

                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                              Existing Color Images
                            </label>

                            <div className="flex flex-wrap gap-4">

                              {color.existingImages.map(
                                (image) => (

                                  <div
                                    key={image.id}
                                    className="w-24 h-24 rounded-xl overflow-hidden border bg-gray-50"
                                  >

                                    <img
                                      src={`${process.env.REACT_APP_API_URL}/public/${image.image_path}`}
                                      alt="Color"
                                      className="w-full h-full object-cover"
                                    />

                                  </div>

                                )
                              )}

                            </div>

                          </div>

                        )}


                        {/* =================================================
                            ADD NEW COLOR IMAGES
                        ================================================= */}

                        <div className="mt-6">

                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Add New Color Images
                          </label>

                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) =>
                              handleColorImageChange(
                                e,
                                cIndex
                              )
                            }
                            className="w-full text-sm"
                          />

                          {color.images?.length > 0 && (

                            <div className="flex flex-wrap gap-3 mt-4">

                              {color.images.map(
                                (image, imageIndex) => (

                                  <div
                                    key={imageIndex}
                                    className="relative"
                                  >

                                    <img
                                      src={URL.createObjectURL(
                                        image
                                      )}
                                      alt="New color"
                                      className="w-20 h-20 object-cover rounded-xl border"
                                    />

                                  </div>

                                )
                              )}

                            </div>

                          )}

                        </div>


                        {/* =================================================
                            SIZES
                        ================================================= */}

                        <div className="mt-7 border-t pt-6">

                          <div className="flex items-center justify-between mb-4">

                            <div>

                              <h4 className="font-bold text-gray-800">
                                Available Sizes
                              </h4>

                              <p className="text-xs text-gray-500 mt-1">
                                Set size and quantity for this color.
                              </p>

                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                addColorSize(cIndex)
                              }
                              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                            >
                              + Add Size
                            </button>

                          </div>


                          {color.sizes?.length === 0 && (
                            <div className="text-sm text-gray-500 bg-gray-50 border border-dashed rounded-xl p-4 text-center">
                              No sizes added.
                            </div>
                          )}


                          {color.sizes?.map(
                            (size, sIndex) => (

                              <div
                                key={sIndex}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                              >

                                {/* Size */}
                                <div>

                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Size
                                  </label>

                                  <input
                                    type="text"
                                    value={size.size}
                                    onChange={(e) =>
                                      handleColorSizeChange(
                                        cIndex,
                                        sIndex,
                                        "size",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                                    placeholder="Example: M, L, XL"
                                  />

                                </div>

                                {/* Quantity */}
                                <div>

                                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                                    Size Quantity
                                  </label>

                                  <input
                                    type="number"
                                    min="0"
                                    value={size.qty}
                                    onChange={(e) =>
                                      handleColorSizeChange(
                                        cIndex,
                                        sIndex,
                                        "qty",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
                                    placeholder="Enter quantity"
                                  />

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    ))}


                    {/* ================= ADD COLOR ================= */}

                    <button
                      type="button"
                      onClick={addColor}
                      className="w-full py-4 border-2 border-dashed border-orange-300 rounded-2xl text-orange-600 font-semibold hover:bg-orange-100 transition"
                    >
                      + Add New Color
                    </button>

                  </div>
                  {/* Product Availability */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Availability
                    </label>

                    <div
                      className={`flex items-center justify-between border rounded-xl px-4 py-3 transition ${formData.status
                          ? "border-green-300 bg-green-50"
                          : "border-red-300 bg-red-50"
                        }`}
                    >
                      <div>
                        <p
                          className={`font-semibold ${formData.status
                              ? "text-green-700"
                              : "text-red-700"
                            }`}
                        >
                          {formData.status ? "Available" : "Not Available"}
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {formData.status
                            ? "Customers can purchase this product."
                            : "Customers cannot purchase this product."}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            status: formData.status ? 0 : 1,
                          })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.status
                            ? "bg-green-500"
                            : "bg-gray-400"
                          }`}
                        aria-label="Toggle product availability"
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${formData.status
                              ? "translate-x-6"
                              : "translate-x-1"
                            }`}
                        />
                      </button>
                    </div>
                  </div>

                </div>


                {/* =====================================================
                    FORM ACTIONS
                ===================================================== */}

                <div className="border-t pt-6 flex flex-col sm:flex-row justify-end gap-3">

                  <button
                    type="button"
                    onClick={() => {
                      setEditingProduct(null);
                      setColors([]);

                      setPreviews({
                        image: null,
                        image2: null,
                        image3: null,
                        image4: null,
                      });
                    }}
                    className="px-7 py-3 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition"
                  >
                    Update Product
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}


        {/* =========================================================
            VIEW PRODUCT MODAL
        ========================================================= */}
        {viewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-hidden">

              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-5 flex items-center justify-between">

                <div>

                  <h3 className="text-xl font-bold">
                    Product Details
                  </h3>

                  <p className="text-sm text-orange-100">
                    Product ID: #{viewProduct.id}
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setViewProduct(null)
                  }
                  className="text-white text-2xl"
                >
                  ✕
                </button>

              </div>


              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">

                {/* Product Image */}
                <div className="flex justify-center mb-6">

                  <img
                    src={
                      viewProduct.image
                        ? `${process.env.REACT_APP_API_URL}/public/${viewProduct.image}`
                        : "/placeholder.jpg"
                    }
                    alt={viewProduct.name}
                    className="w-48 h-48 object-cover rounded-2xl border"
                  />

                </div>


                {/* Product Name */}
                <h3 className="text-2xl font-bold text-gray-800">
                  {viewProduct.name}
                </h3>


                {/* Price */}
                <p className="text-2xl font-bold text-orange-600 mt-2">
                  ₹{viewProduct.price}
                </p>


                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 mt-6">

                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Article Number
                    </p>

                    <p className="font-semibold mt-1">
                      {viewProduct.article_number || "-"}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      HSN Code
                    </p>

                    <p className="font-semibold mt-1">
                      {viewProduct.hsn || "-"}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Quantity
                    </p>

                    <p className="font-semibold mt-1">
                      {viewProduct.qty ?? 0}
                    </p>

                  </div>


                  <div className="bg-gray-50 rounded-xl p-4">

                    <p className="text-xs text-gray-500">
                      Return Days
                    </p>

                    <p className="font-semibold mt-1">
                      {viewProduct.return_days ?? 0} days
                    </p>

                  </div>

                </div>


                {/* Description */}
                {viewProduct.description && (
                  <div className="mt-6">

                    <h4 className="font-bold text-gray-800 mb-2">
                      Description
                    </h4>

                    <div
                      dangerouslySetInnerHTML={{
                        __html:
                          viewProduct.description,
                      }}
                      className="text-gray-600 leading-relaxed"
                    />

                  </div>
                )}


                {/* Close */}
                <div className="flex justify-end mt-7">

                  <button
                    type="button"
                    onClick={() =>
                      setViewProduct(null)
                    }
                    className="px-7 py-3 border border-gray-300 rounded-xl font-semibold hover:bg-gray-100"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default ManageProducts;