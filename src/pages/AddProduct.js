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
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch categories
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

  // Fetch subcategories on category change
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

  // Handle text/number inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle Image Upload Fields
  const handleImageChange = (e, key) => {
    const file = e.target.files[0];

    setImages((prev) => ({
      ...prev,
      [key]: file,
    }));

    if (file) {
      setPreviews((prev) => ({
        ...prev,
        [key]: URL.createObjectURL(file),
      }));
    }
  };

  // Handle Excel file change
  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  // Submit Single Product Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrors({});
    const token = localStorage.getItem("token");

    try {
      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        fd.append(key, formData[key]);
      });

      // append images
      Object.keys(images).forEach((key) => {
        if (images[key]) fd.append(key, images[key]);
      });

      const res = await api.post("add-product", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Product added successfully!");
      toast.success("Product added successfully!");

      // Reset Form
      setFormData({
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

      setImages({ image: null, image2: null, image3: null, image4: null });
      setPreviews({ image: null, image2: null, image3: null, image4: null });
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {});
        setMessage("Please correct the highlighted errors.");
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Bulk Upload Products via Excel
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) return setMessage("Please select an Excel file.");

    setLoading(true);
    setMessage("");
    const token = localStorage.getItem("token");

    try {
      const fd = new FormData();
      fd.append("excel_file", excelFile);

      const res = await api.post("add-products-bulk", fd, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Products uploaded successfully!");
      setExcelFile(null);
    } catch (err) {
      setMessage("Something went wrong during bulk upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

      <div className={`transition-all px-6 py-10 flex justify-center`}>
        <div className="w-full max-w-2xl">

          <div className="bg-white rounded-2xl shadow-xl border">

            <div className="border-b px-8 py-6">
              <h2 className="text-2xl font-semibold">Add New Product</h2>
              <p className="text-sm text-gray-500">Fill in the details below or upload Excel for bulk products</p>
            </div>

            <div className="px-8 py-6">

              {message && (
                <p className={`mb-4 text-sm ${message.includes("success") ? "text-green-600" : "text-red-600"}`}>
                  {message}
                </p>
              )}

              {/* Single Product Form */}
              <form onSubmit={handleSubmit} className="space-y-6">

                <TextField label="Product Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} />
                <TextField label="Price" type="number" name="price" value={formData.price} onChange={handleChange} error={errors.price} />
                <TextField label="Quantity" type="number" name="qty" value={formData.qty} onChange={handleChange} error={errors.qty} />
                <TextField label="GST (%)" type="number" name="gst" value={formData.gst} onChange={handleChange} error={errors.gst} />
                <TextField label="Video Link (Optional)" name="video_link" value={formData.video_link} onChange={handleChange} />

                {/* <div>
                  <label className="block mb-1">Description</label>
                  <textarea name="description" rows="4" value={formData.description}
                    onChange={handleChange}
                    className="w-full border rounded-xl px-4 py-3" />
                </div> */}
                <div>
                  <label className="block mb-1">Description</label>

                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(value) =>
                      setFormData({ ...formData, description: value })
                    }
                    className="bg-white rounded-xl"
                  />

                  {errors.description && (
                    <p className="text-red-600 text-xs">{errors.description[0]}</p>
                  )}
                </div>

                <SelectField label="Category" name="category_id" list={categories} value={formData.category_id} onChange={handleChange} />
                {subcategories.length > 0 && (
                  <SelectField label="Subcategory" name="subcategory_id" list={subcategories} value={formData.subcategory_id} onChange={handleChange} />
                )}

                <div>
                  <label className="block mb-1">Product Type</label>
                  <select name="product_type" value={formData.product_type} onChange={handleChange} className="w-full border rounded-xl px-4 py-3">
                    <option value="none">None</option>
                    <option value="new">New Arrival</option>
                    <option value="special_offer">Special Offer</option>
                    <option value="hot_deal">Hot Deal</option>
                  </select>
                </div>

                <ImageUpload label="Image 1" field="image" preview={previews.image} onChange={handleImageChange} />
                <ImageUpload label="Image 2" field="image2" preview={previews.image2} onChange={handleImageChange} />
                <ImageUpload label="Image 3" field="image3" preview={previews.image3} onChange={handleImageChange} />
                <ImageUpload label="Image 4" field="image4" preview={previews.image4} onChange={handleImageChange} />

                <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-xl">
                  {loading ? "Adding..." : "Add Product"}
                </button>
              </form>

              {/* Bulk Upload */}
              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-semibold mb-2">Bulk Upload via Excel</h3>
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleExcelChange} className="mb-3" />
                <button onClick={handleBulkUpload} disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-xl">
                  {loading ? "Uploading..." : "Upload Excel"}
                </button>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

// Reusable Input Components
const TextField = ({ label, name, value, onChange, type = "text", error }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input type={type} name={name} value={value} onChange={onChange} className="w-full border rounded-xl px-4 py-3" />
    {error && <p className="text-red-600 text-xs">{error[0]}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, list }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <select name={name} value={value} onChange={onChange} className="w-full border rounded-xl px-4 py-3">
      <option value="">Select</option>
      {list.map((i) => (
        <option key={i.id} value={i.id}>{i.name}</option>
      ))}
    </select>
  </div>
);

const ImageUpload = ({ label, field, preview, onChange }) => (
  <div>
    <label className="block mb-1">{label}</label>
    <input type="file" accept="image/*" onChange={(e) => onChange(e, field)} />
    {preview && <img src={preview} alt="" className="w-24 h-24 mt-2 rounded-lg border object-cover" />}
  </div>
);

export default AddProduct;
