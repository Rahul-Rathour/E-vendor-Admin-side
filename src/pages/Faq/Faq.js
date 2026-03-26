import React, { useEffect, useState } from "react";
import api from "../../api";
import SidebarMenu from "../../components/SidebarMenu";
import { toast } from "react-toastify";

const Faq = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [editId, setEditId] = useState(null);

    // Load FAQs
    const fetchFaqs = async () => {
        try {
            const res = await api.get("faq");
            setFaqs(res.data.data);
        } catch (err) {
            console.error(err);
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
            toast.error("Please fill all fields");
            return;
        }

        try {
            const payload = { question, answer };

            if (editId) {
                await api.put(`admin/faqs/${editId}`, payload);
                toast.success("FAQ updated successfully");
            } else {
                await api.post("admin/faqs", payload);
                toast.success("FAQ created successfully");
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
        if (!window.confirm("Are you sure you want to delete this FAQ?")) return;

        try {
            await api.delete(`admin/faqs/${id}`);
            toast.success("FAQ deleted");
            fetchFaqs();
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete");
        }
    };

    const resetForm = () => {
        setEditId(null);
        setQuestion("");
        setAnswer("");
    };

    if (loading)
        return (
            <p className="text-center mt-10 text-gray-500 text-lg animate-pulse">
                Loading FAQs...
            </p>
        );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300">
            {/* <SidebarMenu onToggle={(open) => setSidebarOpen(open)} /> */}

            <div
                className={`transition-all duration-300 p-6`}
            >
                <div className="max-w-4xl mx-auto">

                    {/* Header */}
                    <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
                        {editId ? "Edit FAQ" : "Add New FAQ"}
                    </h2>

                    {/* Form Card */}
                    <form
                        onSubmit={handleSubmit}
                        className="backdrop-blur-lg bg-white/70 shadow-xl p-6 rounded-2xl border border-white/30 space-y-4"
                    >
                        <input
                            type="text"
                            placeholder="FAQ Question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <textarea
                            rows="3"
                            placeholder="FAQ Answer"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none"
                        />

                        <div className="flex items-center gap-4">
                            <button
                                className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition shadow"
                            >
                                {editId ? "Update FAQ" : "Create FAQ"}
                            </button>

                            {editId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition shadow"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>

                    <hr className="my-10 border-gray-300" />

                    {/* FAQ List */}
                    <h2 className="text-2xl font-semibold mb-4">All FAQs</h2>

                    <div className="grid gap-6">
                        {faqs.map((faq) => (
                            <div
                                key={faq.id}
                                className="bg-white shadow-xl border border-gray-200 rounded-xl p-5 hover:shadow-2xl transition transform hover:-translate-y-1"
                            >
                                <h3 className="text-xl font-semibold text-gray-800">
                                    {faq.question}
                                </h3>

                                <p className="text-gray-700 mt-2">{faq.answer}</p>

                                <div className="flex gap-3 mt-4">
                                    <button
                                        onClick={() => handleEdit(faq)}
                                        className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:bg-green-700 transition"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => handleDelete(faq.id)}
                                        className="bg-red-600 text-white px-4 py-1.5 rounded-lg hover:bg-red-700 transition"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Faq;