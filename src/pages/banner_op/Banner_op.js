import React, { useEffect, useState } from "react";
import api from "../../api";
import SidebarMenu from "../../components/SidebarMenu";

const Banner_op = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
const [sidebarOpen, setSidebarOpen] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);

  const [showModal, setShowModal] = useState(false);

  // Load banners
  const fetchBanners = async () => {
    try {
      const res = await api.get("banners");
      setBanners(res.data.data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Preview image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Create or Update submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image && !editId) {
      alert("Please upload an image");
      return;
    }

    const formData = new FormData();
    if (image) formData.append("image", image);

    try {
      if (editId) {
        await api.post(`banners/${editId}`, formData);
        alert("Banner updated successfully");
      } else {
        await api.post("banners", formData);
        alert("Banner created successfully");
      }

      resetForm();
      fetchBanners();
      setShowModal(false);

    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    }
  };

  // Edit banner
  const handleEdit = (banner) => {
    setEditId(banner.id);
    setPreview(`${process.env.REACT_APP_API_URL}/public/${banner.image}`);
    setImage(null);
    setShowModal(true);
  };

  // Delete banner
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await api.delete(`banners/${id}`);
      fetchBanners();
    } catch (error) {
      console.error(error);
      alert("Failed to delete");
    }
  };

  // Reset modal/form
  const resetForm = () => {
    setEditId(null);
    setImage(null);
    setPreview(null);
  };

  if (loading)
    return <p className="text-center mt-20 text-gray-600">Loading banners...</p>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */} 
      <div className={`transition-all duration-300 px-6 py-8`}>

        {/* Header with Add button */}
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8 text-center">
          Manage Banners
        </h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow"
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            + Add New
          </button>
        </div>

        {/* ---------- TABLE OF BANNERS ---------- */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Banner Image</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {banners.map((banner) => (
                <tr key={banner.id} className="border-b hover:bg-gray-50">

                  <td className="px-4 py-3">{banner.id}</td>

                  <td className="px-4 py-3">
                    <img
                      src={`${process.env.REACT_APP_API_URL}/public/${banner.image}`}
                      className="w-40 h-20 object-cover rounded border"
                      alt="banner"
                    />
                  </td>

                  <td className="px-4 py-3 flex gap-3">
                    <button
                      className="bg-green-600 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(banner)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(banner.id)}
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ---------- MODAL FOR ADD / EDIT ---------- */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-xl w-96 shadow-xl">

              <h2 className="text-xl font-bold mb-4">
                {editId ? "Edit Banner" : "Add New Banner"}
              </h2>

              <form onSubmit={handleSubmit} className="grid gap-4">

                <input
                  type="file"
                  accept="image/*"
                  className="border p-2 rounded"
                  onChange={handleImageChange}
                />

                {preview && (
                  <img
                    src={preview}
                    alt="preview"
                    className="w-full h-40 object-cover border rounded"
                  />
                )}

                <button className="bg-blue-600 text-white py-2 rounded">
                  {editId ? "Update Banner" : "Create Banner"}
                </button>

                <button
                  type="button"
                  className="bg-gray-400 text-white py-2 rounded"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                >
                  Cancel
                </button>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Banner_op;