import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const PrivacyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // View Modal
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Fetch Policies
  const loadPolicies = () => {
    api
      .get("/privacy-policy")
      .then((res) => {
        setPolicies(res.data.data || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPolicies();
  }, []);

  // Open Add Modal
  const openAddModal = () => {
    setEditId(null);
    setTitle("");
    setContent("");
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setEditId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setModalOpen(true);
  };

  // Save Policy
  const handleSave = (e) => {
    e.preventDefault();
    if (!title || !content) {
      toast.error("Please fill all fields");
      return;
    }

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);

    const url = editId ? `/privacy-policy/${editId}` : "/privacy-policy";

    api
      .post(url, form)
      .then(() => {
        toast.success(editId ? "Policy updated successfully!" : "Policy added successfully!");
        setModalOpen(false);
        loadPolicies();
      })
      .catch(() => toast.error("Failed to save policy"));
  };

  // Delete Policy
  const deletePolicy = (id) => {
    if (!window.confirm("Delete this policy?")) return;

    api
      .delete(`/privacy-policy/${id}`)
      .then(() => {
        toast.success("Policy deleted successfully");
        loadPolicies();
      })
      .catch(() => toast.error("Failed to delete policy"));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-orange-600 text-xl">Loading policies...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-orange-100 mt-2">Manage your website privacy policies</p>
        </div>

        {/* Add Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={openAddModal}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 shadow-lg"
          >
            + Add New Policy
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Title</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Content Preview</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {policies.map((item) => (
                  <tr key={item.id} className="hover:bg-orange-50 transition">
                    <td className="px-6 py-5 font-medium text-gray-800">
                      {item.title}
                    </td>
                    <td className="px-6 py-5 text-gray-600">
                      {item.content.length > 120
                        ? item.content.substring(0, 120) + "..."
                        : item.content}
                    </td>
                    <td className="px-8 py-5 text-center flex justify-center gap-4">
                      <button
                        onClick={() => {
                          setViewItem(item);
                          setViewModal(true);
                        }}
                        className="text-xl hover:scale-110 transition"
                        title="View"
                      >
                        👁
                      </button>
                      <button
                        onClick={() => openEditModal(item)}
                        className="text-blue-600 text-xl hover:scale-110 transition"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deletePolicy(item.id)}
                        className="text-red-600 text-xl hover:scale-110 transition"
                        title="Delete"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                ))}

                {policies.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-16 text-gray-500">
                      No privacy policies found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ====================== VIEW MODAL ====================== */}
      {viewModal && viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold">{viewItem.title}</h3>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {viewItem.content}
              </p>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setViewModal(false)}
                className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================== ADD / EDIT MODAL ====================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold">
                {editId ? "Edit Policy" : "Add New Policy"}
              </h3>
            </div>

            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Policy Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:border-orange-500"
                  placeholder="e.g. Privacy Policy"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  rows="12"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:border-orange-500"
                  placeholder="Write full policy content here..."
                  required
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700"
                >
                  {editId ? "Update Policy" : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicy;