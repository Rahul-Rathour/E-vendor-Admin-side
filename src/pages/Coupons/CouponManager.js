import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const CouponManager = () => {
  const [coupons, setCoupons] = useState([]);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewCoupon, setViewCoupon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filters + search + pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [entriesToShow, setEntriesToShow] = useState(10);
  const [page, setPage] = useState(1);

  // Form State
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

  // Load coupons
  const fetchCoupons = async () => {
    try {
      const res = await api.get("/coupons");
      setCoupons(res.data || []);
    } catch (err) {
      console.error("Error loading coupons:", err);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Create / Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingCoupon) {
        await api.put(`/coupons/${editingCoupon.id}`, formData);
        toast.success("Coupon updated");
      } else {
        await api.post("/coupons", formData);
        toast.success("Coupon created");
      }

      setFormData(defaultForm);
      setEditingCoupon(null);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to save coupon");
    }
  };

  // Add new (open modal)
  const openAddModal = () => {
    setEditingCoupon(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  // Edit coupon
  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData(coupon);
    setShowModal(true);
  };

  // Delete coupon
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;

    try {
      await api.delete(`/coupons/${id}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // ------------------ FILTER + SORT + PAGINATION ------------------

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold text-gray-800">
          Manage Coupons
        </h2>

        {/* ADD COUPON BUTTON */}
        <button
          onClick={openAddModal}
          className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700"
        >
          + Add New Coupon
        </button>
      </div>

      {/* ------------------ FILTER CONTROLS ------------------ */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex gap-3">
          <select
            value={entriesToShow}
            onChange={(e) => {
              setEntriesToShow(Number(e.target.value));
              setPage(1);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="10">Show 10</option>
            <option value="20">Show 20</option>
            <option value="50">Show 50</option>
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">Sort By</option>
            <option value="date">Newest First</option>
            <option value="value">Discount Value</option>
            <option value="usage">Usage Limit</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search coupon..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-lg w-64"
        />
      </div>

      {/* ------------------ COUPON TABLE ------------------ */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100 text-gray-600 text-sm">
              <th className="p-4 text-left">ID</th>
              <th className="p-4 text-left">Code</th>
              <th className="p-4 text-left">Type</th>
              <th className="p-4 text-left">Value</th>
              <th className="p-4 text-left">Usage</th>
              <th className="p-4 text-left">Start</th>
              <th className="p-4 text-left">End</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedCoupons.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="p-4">#{c.id}</td>
                <td className="p-4 font-medium">{c.code}</td>
                <td className="p-4">{c.discount_type}</td>
                <td className="p-4">{c.discount_value}</td>
                <td className="p-4">
                  {c.usage_limit} / {c.per_user_limit || "∞"}
                </td>
                <td className="p-4">{c.start_date}</td>
                <td className="p-4">{c.end_date}</td>

                <td className="p-4">
                  {c.status ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="p-4 flex gap-3">
                  <button
                    onClick={() => setViewCoupon(c)}
                    className="text-yellow-600 text-xl"
                  >
                    👁
                  </button>

                  <button
                    onClick={() => handleEdit(c)}
                    className="text-blue-600 text-xl"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-red-600 text-xl"
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}

            {paginatedCoupons.length === 0 && (
              <tr>
                <td colSpan="9" className="p-6 text-center text-gray-500">
                  No coupons found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ------------------ PAGINATION ------------------ */}
      <div className="flex justify-end mt-6 items-center gap-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-40"
        >
          Prev
        </button>

        <span className="font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded-lg disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* ---------------- ADD / EDIT MODAL ---------------- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">

            <h3 className="text-xl font-semibold mb-4">
              {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <input
                type="text"
                name="code"
                placeholder="Coupon Code"
                value={formData.code}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />

              <select
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>

              <input
                type="number"
                name="discount_value"
                value={formData.discount_value}
                onChange={handleChange}
                placeholder="Discount Value"
                className="border p-2 rounded"
                required
              />

              <input
                type="number"
                name="min_cart_amount"
                value={formData.min_cart_amount}
                onChange={handleChange}
                placeholder="Minimum Cart Amount"
                className="border p-2 rounded"
              />

              <input
                type="number"
                name="max_discount"
                value={formData.max_discount}
                onChange={handleChange}
                placeholder="Maximum Discount"
                className="border p-2 rounded"
              />

              <input
                type="number"
                name="usage_limit"
                value={formData.usage_limit}
                onChange={handleChange}
                placeholder="Total Usage Limit"
                className="border p-2 rounded"
              />

              <input
                type="number"
                name="per_user_limit"
                value={formData.per_user_limit}
                onChange={handleChange}
                placeholder="Per User Limit"
                className="border p-2 rounded"
              />

              <input
                type="datetime-local"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="border p-2 rounded"
              />

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 rounded"
              >
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
              </select>

              <div className="col-span-2 flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-lg"
                >
                  {editingCoupon ? "Update" : "Create"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ---------------- VIEW MODAL ---------------- */}
      {viewCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Coupon Details</h3>

            <p><strong>Code:</strong> {viewCoupon.code}</p>
            <p><strong>Type:</strong> {viewCoupon.discount_type}</p>
            <p><strong>Value:</strong> {viewCoupon.discount_value}</p>
            <p><strong>Min Cart:</strong> ₹{viewCoupon.min_cart_amount}</p>
            <p><strong>Max Discount:</strong> ₹{viewCoupon.max_discount}</p>
            <p><strong>Usage Limit:</strong> {viewCoupon.usage_limit}</p>
            <p><strong>Per User:</strong> {viewCoupon.per_user_limit}</p>
            <p><strong>Start:</strong> {viewCoupon.start_date}</p>
            <p><strong>End:</strong> {viewCoupon.end_date}</p>

            <div className="flex justify-end mt-5">
              <button
                onClick={() => setViewCoupon(null)}
                className="px-4 py-2 border rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CouponManager;