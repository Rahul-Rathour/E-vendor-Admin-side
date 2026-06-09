import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewCoupon, setViewCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [page, setPage] = useState(1);

  const defaultForm = {
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_cart_amount: "",
    max_discount: "",
    usage_limit: "",
    per_user_limit: "",
    start_date: "",
    end_date: "",
    status: 1,
  };

  const [formData, setFormData] = useState(defaultForm);

  const fetchCoupons = async () => {
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load coupons");
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.id}`, formData);
        toast.success("Coupon updated successfully!");
      } else {
        await api.post("/coupons", formData);
        toast.success("Coupon created successfully!");
      }
      setFormData(defaultForm);
      setEditingCoupon(null);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save coupon");
    }
  };

  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData(coupon);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted successfully!");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  // Filters & Pagination
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCoupons = [...filteredCoupons].sort((a, b) => {
    if (sortOption === "date") return new Date(b.start_date) - new Date(a.start_date);
    if (sortOption === "value") return b.discount_value - a.discount_value;
    if (sortOption === "usage") return b.usage_limit - a.usage_limit;
    return 0;
  });

  const totalPages = Math.ceil(sortedCoupons.length / entriesToShow);
  const paginatedCoupons = sortedCoupons.slice(
    (page - 1) * entriesToShow,
    (page - 1) * entriesToShow + entriesToShow
  );

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Manage Coupons</h1>
          <p className="text-orange-100 mt-2">Create and manage discount coupons</p>
        </div> */}

        {/* Controls */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <select
              value={entriesToShow}
              onChange={(e) => { setEntriesToShow(Number(e.target.value)); setPage(1); }}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value="10">Show 10</option>
              <option value="20">Show 20</option>
              <option value="50">Show 50</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value="">Sort By</option>
              <option value="date">Newest First</option>
              <option value="value">Discount Value</option>
              <option value="usage">Usage Limit</option>
            </select>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search coupon code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
            />

            <button
              onClick={openAddModal}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-semibold flex items-center gap-2 whitespace-nowrap"
            >
              + Add New Coupon
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Type</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Value</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Min Cart</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Valid From</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Valid Till</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-orange-50 transition">
                    <td className="px-6 py-5 font-semibold text-gray-800">{c.code}</td>
                    <td className="px-6 py-5 capitalize">{c.discount_type}</td>
                    <td className="px-6 py-5 font-medium">
                      {c.discount_value} {c.discount_type === "percentage" ? "%" : "₹"}
                    </td>
                    <td className="px-6 py-5">₹{c.min_cart_amount || 0}</td>
                    <td className="px-6 py-5">
                      {c.usage_limit} / {c.per_user_limit || "∞"}
                    </td>
                    <td className="px-6 py-5 text-sm">{c.start_date}</td>
                    <td className="px-6 py-5 text-sm">{c.end_date}</td>
                    <td className="px-6 py-5">
                      {c.status ? (
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-2xl text-xs font-medium">Active</span>
                      ) : (
                        <span className="px-4 py-1.5 bg-red-100 text-red-700 rounded-2xl text-xs font-medium">Inactive</span>
                      )}
                    </td>
                    <td className="px-8 py-5 text-center flex justify-center gap-4">
                      <button onClick={() => setViewCoupon(c)} className="text-xl hover:scale-110 transition" title="View">👁</button>
                      <button onClick={() => handleEdit(c)} className="text-blue-600 text-xl hover:scale-110 transition" title="Edit">✏️</button>
                      <button onClick={() => handleDelete(c.id)} className="text-red-600 text-xl hover:scale-110 transition" title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
                {paginatedCoupons.length === 0 && (
                  <tr>
                    <td colSpan="9" className="p-12 text-center text-gray-500">No coupons found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 px-2">
          <span className="text-sm text-gray-600">
            Showing {(page - 1) * entriesToShow + 1} to{" "}
            {Math.min(page * entriesToShow, sortedCoupons.length)} of {sortedCoupons.length}
          </span>
          <div className="flex gap-3">
            <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100">Previous</button>
            <span className="px-6 py-3 bg-orange-100 text-orange-700 font-medium rounded-2xl">Page {page} of {totalPages || 1}</span>
            <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100">Next</button>
          </div>
        </div>
      </div>

      {/* ====================== RESPONSIVE ADD / EDIT MODAL ====================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl max-h-[95vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6 flex-shrink-0">
              <h3 className="text-2xl font-bold">
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </h3>
            </div>

            {/* Scrollable Form Area */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Coupon Code</label>
                <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Type</label>
                <select name="discount_type" value={formData.discount_type} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3">
                  <option value="percentage">Percentage (%)</option>
                  <option value="flat">Flat Amount (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Discount Value</label>
                <input type="number" name="discount_value" value={formData.discount_value} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" required />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Minimum Cart Amount</label>
                <input type="number" name="min_cart_amount" value={formData.min_cart_amount} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Maximum Discount</label>
                <input type="number" name="max_discount" value={formData.max_discount} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Total Usage Limit</label>
                <input type="number" name="usage_limit" value={formData.usage_limit} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Per User Limit</label>
                <input type="number" name="per_user_limit" value={formData.per_user_limit} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input type="datetime-local" name="start_date" value={formData.start_date} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">End Date</label>
                <input type="datetime-local" name="end_date" value={formData.end_date} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-300 rounded-2xl px-5 py-3">
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              {/* Buttons - Always Visible at Bottom */}
              <div className="md:col-span-2 flex justify-end gap-4 pt-6 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-8 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 font-medium"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold mb-6">Coupon Details</h3>
            <div className="space-y-4 text-gray-700">
              <p><strong>Code:</strong> <span className="font-mono text-lg">{viewCoupon.code}</span></p>
              <p><strong>Type:</strong> {viewCoupon.discount_type}</p>
              <p><strong>Value:</strong> {viewCoupon.discount_value} {viewCoupon.discount_type === "percentage" ? "%" : "₹"}</p>
              <p><strong>Min Cart Amount:</strong> ₹{viewCoupon.min_cart_amount}</p>
              <p><strong>Max Discount:</strong> ₹{viewCoupon.max_discount}</p>
              <p><strong>Usage Limit:</strong> {viewCoupon.usage_limit}</p>
              <p><strong>Per User Limit:</strong> {viewCoupon.per_user_limit}</p>
              <p><strong>Valid From:</strong> {viewCoupon.start_date}</p>
              <p><strong>Valid Till:</strong> {viewCoupon.end_date}</p>
            </div>
            <div className="flex justify-end mt-8">
              <button onClick={() => setViewCoupon(null)} className="px-8 py-3 border rounded-2xl hover:bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManager;