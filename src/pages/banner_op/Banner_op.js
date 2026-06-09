import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const Banner_op = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  // Load banners
  const fetchBanners = async () => {
    try {
      const res = await api.get("banners");
      setBanners(res.data.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to load banners");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image && !editId) {
      toast.error("Please select an image");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);

    try {
      if (editId) {
        await api.post(`banners/${editId}`, formData);
        toast.success("Banner updated successfully!");
      } else {
        await api.post("banners", formData);
        toast.success("Banner created successfully!");
      }

      resetForm();
      fetchBanners();
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (banner) => {
    setEditId(banner.id);
    setPreview(`${process.env.REACT_APP_API_URL}/public/${banner.image}`);
    setImage(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await api.delete(`banners/${id}`);
      toast.success("Banner deleted successfully!");
      fetchBanners();
    } catch (error) {
      toast.error("Failed to delete banner");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setImage(null);
    setPreview(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-orange-600 text-xl">Loading banners...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Manage Banners</h1>
          <p className="text-orange-100 mt-2">Upload and manage homepage banners</p>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg"
          >
            + Add New Banner
          </button>
        </div>

        {/* Banners Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Banner Image</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-orange-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-700">#{banner.id}</td>
                    <td className="px-6 py-5">
                      <img
                        src={`${process.env.REACT_APP_API_URL}/public/${banner.image}`}
                        alt="Banner"
                        className="w-64 h-32 object-cover rounded-2xl border shadow-sm"
                      />
                    </td>
                    <td className="px-8 py-5 text-center flex justify-center gap-4">
                      <button
                        onClick={() => handleEdit(banner)}
                        className="text-blue-600 hover:text-blue-700 text-2xl hover:scale-110 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="text-red-600 hover:text-red-700 text-2xl hover:scale-110 transition"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}

                {banners.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-gray-500">
                      No banners found. Add your first banner.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================== ADD / EDIT MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold">
                {editId ? "Edit Banner" : "Add New Banner"}
              </h3>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-2xl file:border-0 file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
                />
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-52 object-cover rounded-2xl border shadow"
                  />
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 font-medium"
                >
                  {editId ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banner_op;