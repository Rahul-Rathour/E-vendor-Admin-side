import React, { useEffect, useState } from "react";
import api from "../api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    category_id: "",
    subcategory_id: "",
    product_type: "none",
    qty: "",
    gst: "",
    video_link: "",
  });

  const [images, setImages] = useState({
    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [previews, setPreviews] = useState({
    image: null,
    image2: null,
    image3: null,
    image4: null,
  });

  const [excelFile, setExcelFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const [colors, setColors] = useState([]); // Start empty

  // Fetch Categories
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

  // Fetch Subcategories
  useEffect(() => {
    if (!formData.category_id) {
      setSubcategories([]);
      return;
    }
    const fetchSubcategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("subcategories", {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (!file) return;

    setImages((prev) => ({ ...prev, [key]: file }));
    setPreviews((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));

    // Clear image error
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleColorImageChange = (e, colorIndex) => {
    const files = Array.from(e.target.files);
    const updated = [...colors];
    updated[colorIndex].images.push(...files);
    setColors(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setGeneralError("");
    setErrors({});

    const token = localStorage.getItem("token");
    const fd = new FormData();

    // Append basic fields
    Object.keys(formData).forEach((key) => {
      if (formData[key]) fd.append(key, formData[key]);
    });

    // Append main images
    Object.keys(images).forEach((key) => {
      if (images[key]) fd.append(key, images[key]);
    });

    // Append Colors
    colors.forEach((color, i) => {
      if (!color.name?.trim()) return;

      fd.append(`colors[${i}][name]`, color.name);
      fd.append(`colors[${i}][code]`, color.code || "");

      color.images.forEach((img, idx) => {
        fd.append(`colors[${i}][images][${idx}]`, img);
      });

      color.sizes.forEach((size, idx) => {
        if (size.size?.trim()) {
          fd.append(`colors[${i}][sizes][${idx}][size]`, size.size);
          fd.append(`colors[${i}][sizes][${idx}][qty]`, size.qty || 0);
        }
      });
    });

    try {
      const res = await api.post("add-product", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product added successfully!");
      
      // Reset form
      setFormData({
        name: "", price: "", description: "", category_id: "", subcategory_id: "",
        product_type: "none", qty: "", gst: "", video_link: ""
      });
      setImages({ image: null, image2: null, image3: null, image4: null });
      setPreviews({ image: null, image2: null, image3: null, image4: null });
      setColors([]);
      setErrors({});

    } catch (err) {
      if (err.response?.status === 422) {
        const errData = err.response.data.errors || {};
        setErrors(errData);
        
        // Show general message if available
        setGeneralError(err.response.data.message || "Please check the errors below");
      } else {
        setGeneralError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Color Handlers
  const addColor = () => {
    setColors([...colors, { name: "", code: "", images: [], sizes: [{ size: "", qty: "" }] }]);
  };

  const handleColorChange = (index, field, value) => {
    const updated = [...colors];
    updated[index][field] = value;
    setColors(updated);
  };

  const addColorSize = (colorIndex) => {
    const updated = [...colors];
    updated[colorIndex].sizes.push({ size: "", qty: "" });
    setColors(updated);
  };

  const handleColorSizeChange = (colorIndex, sizeIndex, field, value) => {
    const updated = [...colors];
    updated[colorIndex].sizes[sizeIndex][field] = value;
    setColors(updated);
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
            <h2 className="text-3xl font-bold">Add New Product</h2>
            <p className="text-orange-100 mt-1">Fill the details below</p>
          </div>

          <div className="p-8">
            {generalError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                {generalError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField label="Product Name *" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                <TextField label="Price *" type="number" name="price" value={formData.price} onChange={handleChange} error={errors.price} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TextField label="Quantity" type="number" name="qty" value={formData.qty} onChange={handleChange} error={errors.qty} />
                <TextField label="GST (%)" type="number" name="gst" value={formData.gst} onChange={handleChange} error={errors.gst} />
                <TextField label="Video Link" name="video_link" value={formData.video_link} onChange={handleChange} error={errors.video_link} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <ReactQuill
                  theme="snow"
                  value={formData.description}
                  onChange={(value) => setFormData({ ...formData, description: value })}
                  className="bg-white rounded-2xl border border-gray-300"
                />
                {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description[0]}</p>}
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SelectField label="Category *" name="category_id" value={formData.category_id} onChange={handleChange} list={categories} error={errors.category_id} />
                {subcategories.length > 0 && (
                  <SelectField label="Subcategory" name="subcategory_id" value={formData.subcategory_id} onChange={handleChange} list={subcategories} error={errors.subcategory_id} />
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Type</label>
                  <select
                    name="product_type"
                    value={formData.product_type}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-orange-500"
                  >
                    <option value="none">None</option>
                    <option value="new">New Arrival</option>
                    <option value="special_offer">Special Offer</option>
                    <option value="hot_deal">Hot Deal</option>
                  </select>
                </div>
              </div>

              {/* Colors Section */}
              <div className="border border-orange-200 rounded-3xl p-6 bg-orange-50">
                <h3 className="text-xl font-semibold text-orange-800 mb-4">Product Colors & Variants</h3>

                {colors.map((color, index) => (
                  <div key={index} className="bg-white p-6 rounded-2xl mb-6 border border-orange-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <TextField
                        label="Color Name *"
                        value={color.name}
                        onChange={(e) => handleColorChange(index, "name", e.target.value)}
                      />
                      <TextField
                        label="Color Code (Hex)"
                        value={color.code}
                        onChange={(e) => handleColorChange(index, "code", e.target.value)}
                        placeholder="#FF0000"
                      />
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium mb-2">Color Images</label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleColorImageChange(e, index)}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-6 file:rounded-full file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                      />
                    </div>

                    {/* Sizes */}
                    <div className="mt-6">
                      <h4 className="font-medium mb-3">Sizes</h4>
                      {color.sizes.map((s, sIndex) => (
                        <div key={sIndex} className="flex gap-4 mb-3">
                          <input
                            type="text"
                            placeholder="Size (S, M, L...)"
                            value={s.size}
                            onChange={(e) => handleColorSizeChange(index, sIndex, "size", e.target.value)}
                            className="border border-gray-300 rounded-xl px-4 py-3 w-1/2"
                          />
                          <input
                            type="number"
                            placeholder="Quantity"
                            value={s.qty}
                            onChange={(e) => handleColorSizeChange(index, sIndex, "qty", e.target.value)}
                            className="border border-gray-300 rounded-xl px-4 py-3 w-1/2"
                          />
                        </div>
                      ))}
                      <button type="button" onClick={() => addColorSize(index)} className="text-orange-600 hover:text-orange-700 text-sm font-medium">
                        + Add Size
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addColor}
                  className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-2xl hover:bg-orange-50 font-medium"
                >
                  + Add Another Color
                </button>
              </div>

              {/* Main Product Images */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Main Product Images</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {["image", "image2", "image3", "image4"].map((key, i) => (
                    <ImageUpload
                      key={i}
                      label={`Image ${i + 1}`}
                      field={key}
                      preview={previews[key]}
                      onChange={handleImageChange}
                      error={errors[key]}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-all text-lg disabled:opacity-70"
              >
                {loading ? "Adding Product..." : "Add Product"}
              </button>
            </form>

            {/* Bulk Upload */}
            <div className="mt-12 pt-8 border-t">
              <h3 className="text-lg font-semibold mb-3">Bulk Upload via Excel</h3>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setExcelFile(e.target.files[0])}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-orange-100 file:text-orange-700"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable Components
const TextField = ({ label, name, value, onChange, type = "text", error, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
    />
    {error && <p className="text-red-600 text-sm mt-1">{error[0]}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, list, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded-2xl px-4 py-3 focus:outline-none focus:border-orange-500"
    >
      <option value="">Select {label}</option>
      {list.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>
    {error && <p className="text-red-600 text-sm mt-1">{error[0]}</p>}
  </div>
);

const ImageUpload = ({ label, field, preview, onChange, error }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      accept="image/jpeg,image/jpg,image/png,image/avif,image/webp"
      onChange={(e) => onChange(e, field)}
      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
    />
    {preview && <img src={preview} alt="preview" className="mt-3 w-24 h-24 object-cover rounded-xl border" />}
    {error && <p className="text-red-600 text-sm mt-1">{error[0]}</p>}
  </div>
);

export default AddProduct;