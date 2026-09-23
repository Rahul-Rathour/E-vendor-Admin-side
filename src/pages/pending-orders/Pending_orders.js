import React, { useState, useEffect } from "react";
import { FaTruck, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api";

const PendingOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [ordersPerPage, setOrdersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [trackingIds, setTrackingIds] = useState({});

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [invoiceNumbers, setInvoiceNumbers] = useState({});

  // ================= FETCH ORDERS =================
  const fetchOrders = async () => {
    try {
      const response = await api.get("orders/pending");

      if (response.data.status) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load pending orders");
    }
  };

  // ================= FETCH DELIVERY PARTNERS =================
  const fetchDeliveryPartners = async () => {
    try {
      const res = await api.get("/delivery-partners");

      setDeliveryPartners(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load delivery partners");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveryPartners();
  }, []);

  // ================= SEARCH =================
  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const result = orders.filter(
      (order) =>
        order.order_number?.toLowerCase().includes(query) ||
        order.shipping_address?.toLowerCase().includes(query)
    );

    setFilteredOrders(result);
    setCurrentPage(1);
    setSelectedOrders([]);
    setSelectAll(false);
  }, [searchQuery, orders]);

  // ================= PAGINATION =================
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  // ================= SELECT ORDER =================
  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((oid) => oid !== id)
        : [...prev, id]
    );
  };

  // ================= SELECT ALL =================
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map((o) => o.id));
    }

    setSelectAll(!selectAll);
  };

  // ================= ASSIGN DELIVERY PARTNER =================
  const handleAssignPartner = async (
    orderId,
    partnerId,
    trackingId
  ) => {
    if (!partnerId) return;

    try {
      await api.put(
        `orders/${orderId}/assign-partner`,
        {
          delivery_partner_id: partnerId,
          tracking_id: trackingId,
        }
      );

      toast.success(
        "Delivery partner assigned successfully!"
      );

      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(
        "Failed to assign delivery partner"
      );
    }
  };

  // ================= MARK SHIPPED =================
  const handleMarkShipped = async (id) => {
    const invoiceNumber = invoiceNumbers[id];

    if (!invoiceNumber || invoiceNumber.trim() === "") {
      toast.warn(
        "Please enter invoice number first!"
      );
      return;
    }

    try {
      // Update order status
      await api.post(
        `order/update-status/${id}`,
        {
          status: "shipped",
        }
      );

      // Generate invoice
      await api.post(
        `/invoice/generate/${id}`,
        {
          invoice_number: invoiceNumber.trim(),
        }
      );

      toast.success(
        "Order shipped and invoice generated successfully!"
      );

      fetchOrders();

      setInvoiceNumbers((prev) => {
        const updated = { ...prev };

        delete updated[id];

        return updated;
      });
    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Failed to update order"
      );
    }
  };

  // ================= MARK CANCELLED =================
  const handleMarkCancelled = async (id) => {
    try {
      await api.post(
        `order/update-status/${id}`,
        {
          status: "cancelled",
        }
      );

      toast.success(
        "Order marked as cancelled!"
      );

      fetchOrders();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update status"
      );
    }
  };

  // ================= BULK ACTION =================
  const handleBulkAction = async (status) => {
    if (selectedOrders.length === 0) {
      toast.warn("No orders selected!");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((id) =>
          api.post(
            `order/update-status/${id}`,
            { status }
          )
        )
      );

      toast.success(
        `Selected orders marked as ${status}!`
      );

      setSelectedOrders([]);
      setSelectAll(false);

      fetchOrders();
    } catch (err) {
      console.error(err);

      toast.error(
        "Failed to update orders"
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4">

      <div className="max-w-7xl mx-auto">

        {/* ================= HEADER ================= */}
        <div className="relative overflow-hidden bg-black rounded-2xl sm:rounded-3xl px-5 sm:px-8 py-6 sm:py-8 mb-6 sm:mb-8 shadow-2xl border border-[#D4AF37]/40">

          <div className="absolute -top-24 -right-20 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-24 -left-20 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex items-center gap-4">

            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-xl sm:rounded-2xl bg-[#D4AF37] text-black flex items-center justify-center text-xl sm:text-2xl font-bold shadow-lg shadow-[#D4AF37]/20">
              P
            </div>

            <div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Pending Orders
              </h1>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Manage orders awaiting processing
              </p>

            </div>

          </div>
        </div>

        {/* ================= CONTROLS CARD ================= */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

            {/* Search */}
            <div className="w-full xl:w-96">

              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Search Pending Orders
              </label>

              <input
                type="text"
                placeholder="Search by order number or address..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
              />

            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">

              {/* Entries */}
              <div className="w-full sm:w-auto">

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Entries
                </label>

                <select
                  value={ordersPerPage}
                  onChange={(e) => {
                    setOrdersPerPage(
                      Number(e.target.value)
                    );
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                >
                  <option value={5}>
                    Show 5
                  </option>

                  <option value={10}>
                    Show 10
                  </option>

                  <option value={20}>
                    Show 20
                  </option>

                  <option value={50}>
                    Show 50
                  </option>
                </select>

              </div>

              {/* Bulk Shipped */}
              <div className="w-full sm:w-auto">

                <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">
                  Action
                </label>

                <button
                  onClick={() =>
                    handleBulkAction("shipped")
                  }
                  disabled={
                    selectedOrders.length === 0
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b8941f] text-black px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg shadow-[#D4AF37]/10 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FaTruck />
                  Mark Selected as Shipped
                </button>

              </div>

              {/* Bulk Cancel */}
              <div className="w-full sm:w-auto">

                <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">
                  Cancel
                </label>

                <button
                  onClick={() =>
                    handleBulkAction("cancelled")
                  }
                  disabled={
                    selectedOrders.length === 0
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-black border border-gray-700 text-gray-300 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FaTimes />
                  Mark Selected as Cancelled
                </button>

              </div>

            </div>

          </div>

          {/* Summary */}
          <div className="mt-5 pt-4 border-t border-gray-800 flex flex-wrap items-center justify-between gap-3">

            <div className="flex items-center gap-4">

              <p className="text-sm text-gray-400">
                Total Pending Orders
              </p>

              <span className="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold">
                {filteredOrders.length}
              </span>

            </div>

            {selectedOrders.length > 0 && (
              <span className="text-sm text-[#D4AF37] font-semibold">
                {selectedOrders.length} selected
              </span>
            )}

          </div>

        </div>

        {/* ================= TABLE CARD ================= */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="min-w-[1650px] w-full border-collapse">

              {/* Table Header */}
              <thead className="bg-black text-white border-b-2 border-[#D4AF37] sticky top-0 z-10">

                <tr>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left whitespace-nowrap w-12">

                    <input
                      type="checkbox"
                      checked={
                        selectAll &&
                        currentOrders.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                    />

                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Order Number
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    User ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Amount
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Address
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Payment
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Created
                  </th>

                  <th className="px-8 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap w-40">
                    Tracking ID
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Delivery Partner
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Invoice Number
                  </th>

                  <th className="px-8 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap w-40">
                    Actions
                  </th>

                </tr>

              </thead>

              {/* Table Body */}
              <tbody>

                {currentOrders.length > 0 ? (

                  currentOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-gray-800 hover:bg-[#D4AF37]/10 transition-colors group"
                    >

                      {/* Checkbox */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(
                            order.id
                          )}
                          onChange={() =>
                            handleSelectOrder(order.id)
                          }
                          className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                        />

                      </td>

                      {/* Order Number */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-black text-gray-300 font-semibold text-sm border border-gray-700 group-hover:border-[#D4AF37]/50 group-hover:text-[#D4AF37] transition">
                          {order.order_number}
                        </span>

                      </td>

                      {/* User ID */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="text-gray-300 font-medium">
                          {order.user_id}
                        </span>

                      </td>

                      {/* Amount */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="font-bold text-[#D4AF37]">
                          ₹{order.total_amount}
                        </span>

                      </td>

                      {/* Address */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <div className="text-gray-400 max-w-xs line-clamp-2 leading-relaxed">
                          {order.shipping_address ||
                            "—"}
                        </div>

                      </td>

                      {/* Status */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="inline-flex items-center px-3 py-1.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-bold">
                          {order.delivery_status ||
                            "pending"}
                        </span>

                      </td>

                      {/* Payment */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="text-gray-300">
                          {order.payment_method ||
                            "COD"}
                        </span>

                      </td>

                      {/* Created */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="text-sm text-gray-400">
                          {order.created_at
                            ? new Date(
                                order.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "—"}
                        </span>

                      </td>

                      {/* Tracking ID */}
                      <td className="px-6 py-5">

                        <input
                          type="text"
                          placeholder="Tracking ID"
                          className="w-full bg-[#080808] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 min-w-[170px] transition"
                          value={
                            trackingIds[order.id] ||
                            order.tracking_id ||
                            ""
                          }
                          onChange={(e) =>
                            setTrackingIds((prev) => ({
                              ...prev,
                              [order.id]:
                                e.target.value,
                            }))
                          }
                        />

                      </td>

                      {/* Delivery Partner */}
                      <td className="px-6 py-5">

                        <select
                          className="w-full bg-[#080808] border border-gray-700 text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 min-w-[170px] transition"
                          value={
                            order.delivery_partner_id ||
                            ""
                          }
                          onChange={(e) =>
                            handleAssignPartner(
                              order.id,
                              e.target.value,
                              trackingIds[order.id] ||
                                order.tracking_id ||
                                ""
                            )
                          }
                        >

                          <option value="">
                            -- Select Partner --
                          </option>

                          {deliveryPartners.map(
                            (partner) => (

                              <option
                                key={partner.id}
                                value={partner.id}
                              >
                                {partner.name}
                              </option>

                            )
                          )}

                        </select>

                      </td>

                      {/* Invoice Number */}
                      <td className="px-6 py-5">

                        <input
                          type="text"
                          placeholder="Invoice Number"
                          className="w-full bg-[#080808] border border-gray-700 text-white placeholder-gray-500 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 min-w-[170px] transition"
                          value={
                            invoiceNumbers[order.id] ||
                            order.invoice?.invoice_number ||
                            ""
                          }
                          onChange={(e) =>
                            setInvoiceNumbers(
                              (prev) => ({
                                ...prev,
                                [order.id]:
                                  e.target.value,
                              })
                            )
                          }
                        />

                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 whitespace-nowrap">

                        <div className="flex justify-center items-center gap-2">

                          {/* Ship */}
                          <button
                            onClick={() =>
                              handleMarkShipped(
                                order.id
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-[#D4AF37] text-black hover:bg-[#b8941f] transition-all flex items-center justify-center shadow-md shadow-[#D4AF37]/10"
                            title="Mark as Shipped"
                          >
                            <FaTruck size={18} />
                          </button>

                          {/* Cancel */}
                          <button
                            onClick={() =>
                              handleMarkCancelled(
                                order.id
                              )
                            }
                            className="w-10 h-10 rounded-xl bg-black border border-gray-700 text-gray-300 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition-all flex items-center justify-center"
                            title="Cancel Order"
                          >
                            <FaTimes size={18} />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="12"
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl mb-4">
                          📦
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                          No Pending Orders Found
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          There are currently no orders
                          awaiting processing.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Mobile Table Hint */}
          <div className="block lg:hidden px-4 py-3 bg-black text-gray-400 text-xs text-center border-t border-[#D4AF37]/20">
            ← Swipe horizontally to view the complete table →
          </div>

          {/* ================= PAGINATION ================= */}
          <div className="flex flex-col lg:flex-row justify-between items-center px-4 sm:px-6 lg:px-8 py-5 sm:py-6 border-t border-gray-800 gap-4">

            <p className="text-sm text-gray-400 text-center lg:text-left">

              {filteredOrders.length > 0 ? (
                <>
                  Showing{" "}
                  <span className="font-semibold text-white">
                    {indexOfFirstOrder + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-semibold text-white">
                    {Math.min(
                      indexOfLastOrder,
                      filteredOrders.length
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-white">
                    {filteredOrders.length}
                  </span>{" "}
                  orders
                </>
              ) : (
                "Showing 0 orders"
              )}

            </p>

            {totalPages > 0 && (

              <div className="flex flex-wrap items-center justify-center gap-2">

                {/* Previous */}
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage(
                      currentPage - 1
                    )
                  }
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex flex-wrap justify-center gap-2">

                  {[...Array(totalPages)].map(
                    (_, i) => (

                      <button
                        key={i}
                        onClick={() =>
                          setCurrentPage(i + 1)
                        }
                        className={`min-w-[42px] px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                          currentPage === i + 1
                            ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/10"
                            : "bg-black text-gray-300 border-gray-700 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                        }`}
                      >
                        {i + 1}
                      </button>

                    )
                  )}

                </div>

                {/* Next */}
                <button
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    setCurrentPage(
                      currentPage + 1
                    )
                  }
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Next
                </button>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
};

export default PendingOrders;