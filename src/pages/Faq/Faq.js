import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [editId, setEditId] = useState(null);

  // Load FAQs
  const fetchFaqs = async () => {
    try {
      const res = await api.get("faq");
      setFaqs(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load FAQs");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Submit (Create / Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question || !answer) {
      toast.error("Please fill both fields");
      return;
    }

    try {
      const payload = { question, answer };

      if (editId) {
        await api.put(`admin/faqs/${editId}`, payload);
        toast.success("FAQ updated successfully!");
      } else {
        await api.post("admin/faqs", payload);
        toast.success("FAQ created successfully!");
      }

      resetForm();
      fetchFaqs();
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  const handleEdit = (faq) => {
    setEditId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this FAQ?")) return;
    try {
      await api.delete(`admin/faqs/${id}`);
      toast.success("FAQ deleted successfully!");
      fetchFaqs();
    } catch (err) {
      toast.error("Failed to delete FAQ");
    }
  };

  const resetForm = () => {
    setEditId(null);
    setQuestion("");
    setAnswer("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <p className="text-orange-600 text-xl">Loading FAQs...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Manage FAQs</h1>
          <p className="text-orange-100 mt-2">Frequently Asked Questions for your customers</p>
        </div>

        {/* Add / Edit Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editId ? "Edit FAQ" : "Add New FAQ"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question
              </label>
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:border-orange-500 focus:outline-none"
                placeholder="Enter your question here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer
              </label>
              <textarea
                rows="4"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full border border-gray-300 rounded-2xl px-5 py-4 focus:border-orange-500 focus:outline-none"
                placeholder="Enter detailed answer..."
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition"
              >
                {editId ? "Update FAQ" : "Create FAQ"}
              </button>

              {editId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 border border-gray-300 hover:bg-gray-100 font-semibold py-4 rounded-2xl transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* FAQs List */}
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">All FAQs ({faqs.length})</h2>

        <div className="space-y-4">
          {faqs.length > 0 ? (
            faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all border border-orange-100"
              >
                <h3 className="text-lg font-semibold text-gray-800 leading-relaxed">
                  {faq.question}
                </h3>
                <p className="text-gray-600 mt-3 leading-relaxed">{faq.answer}</p>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEdit(faq)}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(faq.id)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-500">
              No FAQs added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Faq;