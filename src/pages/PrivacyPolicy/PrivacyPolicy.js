import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const PrivacyPolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  // For Add/Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // View Modal
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);

  // Fetch ALL policies
  const loadPolicies = () => {
    api
      .get("/privacy-policy")
      .then((res) => {
        setPolicies(res.data.data || []);
      })
      .catch((err) => console.error("Error fetching:", err))
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

  // Save or Update Policy
  const handleSave = (e) => {
    e.preventDefault();

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);

    const url = editId
      ? `/privacy-policy/${editId}`
      : "/privacy-policy";

    api
      .post(url, form)
      .then(() => {
        toast.success(editId ? "Updated successfully!" : "Added successfully!");
        setModalOpen(false);
        loadPolicies();
      })
      .catch(() => toast.error("Error saving policy"));
  };

  // Delete Policy
  const deletePolicy = (id) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;

    api
      .delete(`/privacy-policy/${id}`)
      .then(() => {
        toast.success("Deleted successfully");
        loadPolicies();
      })
      .catch(() => toast.error("Error deleting policy"));
  };

  if (loading)
    return <p className="p-6 text-gray-600">Loading...</p>;

  return (
    <div className="p-6">

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold">Privacy Policy</h2>
        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          + Add New Policy
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="p-3">Title</th>
              <th className="p-3">Content</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {policies.map((item) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {item.title.length > 50
                    ? item.title.substring(0, 50) + "..."
                    : item.title}
                </td>

                <td className="p-3">
                  {item.content.length > 60
                    ? item.content.substring(0, 60) + "..."
                    : item.content}
                </td>

                <td className="p-3 text-center space-x-3">
                  {/* View */}
                  <button
                    onClick={() => {
                      setViewItem(item);
                      setViewModal(true);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-green-600 hover:underline"
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deletePolicy(item.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------- VIEW MODAL ---------- */}
      {viewModal && viewItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl max-w-xl w-full">
            <h3 className="text-xl font-semibold mb-3">{viewItem.title}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{viewItem.content}</p>

            <button
              onClick={() => setViewModal(false)}
              className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------- ADD/EDIT MODAL ---------- */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl max-w-xl w-full">
            <h3 className="text-xl font-semibold mb-4">
              {editId ? "Edit Policy" : "Add New Policy"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">

              {/* Title */}
              <input
                type="text"
                placeholder="Policy Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border rounded"
                required
              />

              {/* Content */}
              <textarea
                rows="8"
                placeholder="Policy Description"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3 border rounded"
                required
              ></textarea>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  {editId ? "Update" : "Create"}
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