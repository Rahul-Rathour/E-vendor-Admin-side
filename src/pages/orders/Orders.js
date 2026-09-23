import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaEye, FaFileExcel } from "react-icons/fa";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("orders");

        if (response.data.status) {
          setOrders(response.data.data);
          setFilteredOrders(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast.error("Failed to load orders");
      }
    };

    fetchOrders();
  }, []);

  // Search & Filter
  useEffect(() => {
    let result = [...orders];

    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      result = result.filter(
        (order) =>
          order.order_number?.toLowerCase().includes(query) ||
          order.shipping_address?.toLowerCase().includes(query) ||
          order.delivery_status?.toLowerCase().includes(query)
      );
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter(
        (order) => order.delivery_status === statusFilter
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, orders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;

  const currentOrders = filteredOrders.slice(
    indexOfFirstOrder,
    indexOfLastOrder
  );

  const totalPages = Math.ceil(
    filteredOrders.length / ordersPerPage
  );

  // Excel Download
  const downloadExcel = () => {
    if (filteredOrders.length === 0) {
      toast.warning("No orders available to download");
      return;
    }

    const excelData = filteredOrders.map((order, index) => ({
      "S.No": index + 1,
      "Order Number": order.order_number || "",
      "User ID": order.user_id || "",
      "Amount": order.total_amount || 0,
      "Shipping Address": order.shipping_address || "",
      "Delivery Status": order.delivery_status || "",
      "Payment Method": order.payment_method || "",
      "Created At": order.created_at
        ? new Date(order.created_at).toLocaleDateString("en-IN")
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    worksheet["!cols"] = [
      { wch: 8 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
      { wch: 18 },
      { wch: 18 },
      { wch: 18 },
    ];

    XLSX.writeFile(
      workbook,
      `orders_${new Date().toISOString().split("T")[0]}.xlsx`
    );

    toast.success("Orders downloaded successfully");
  };

  // Page Change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
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
              O
            </div>

            <div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white">
                Manage Orders
              </h1>

              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Manage and track customer orders
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
                Search Orders
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full xl:w-auto">

              {/* Entries */}
              <div className="w-full sm:w-auto">

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Entries
                </label>

                <select
                  value={ordersPerPage}
                  onChange={(e) => {
                    setOrdersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                >
                  <option value={5}>Show 5</option>
                  <option value={10}>Show 10</option>
                  <option value={20}>Show 20</option>
                  <option value={50}>Show 50</option>
                </select>

              </div>

              {/* Status */}
              <div className="w-full sm:w-auto">

                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full sm:w-auto bg-[#080808] border border-gray-700 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>

              </div>

              {/* Excel */}
              <div className="w-full sm:w-auto">

                <label className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-transparent mb-2">
                  Download
                </label>

                <button
                  onClick={downloadExcel}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#D4AF37] hover:bg-[#b8941f] text-black px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all shadow-lg shadow-[#D4AF37]/10"
                >
                  <FaFileExcel size={18} />
                  Download Excel
                </button>

              </div>

            </div>

          </div>

          {/* Total Orders */}
          <div className="mt-5 pt-4 border-t border-gray-800 flex items-center justify-between">

            <p className="text-sm text-gray-400">
              Total Orders
            </p>

            <span className="inline-flex items-center justify-center min-w-[42px] px-3 py-1.5 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 text-sm font-bold">
              {filteredOrders.length}
            </span>

          </div>

        </div>

        {/* ================= ORDERS TABLE ================= */}
        <div className="bg-[#111111] rounded-2xl sm:rounded-3xl shadow-2xl border border-[#D4AF37]/20 overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] border-collapse">

              {/* Table Header */}
              <thead className="bg-black text-white border-b-2 border-[#D4AF37]">

                <tr>

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
                    Shipping Address
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Payment
                  </th>

                  <th className="px-5 sm:px-6 py-4 sm:py-5 text-left text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Created At
                  </th>

                  <th className="px-5 sm:px-8 py-4 sm:py-5 text-center text-xs sm:text-sm font-semibold uppercase tracking-wider whitespace-nowrap">
                    Action
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

                      {/* Shipping Address */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5">

                        <div className="text-gray-400 max-w-xs line-clamp-2 leading-relaxed">
                          {order.shipping_address || "—"}
                        </div>

                      </td>

                      {/* Status */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span
                          className={`inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-full border ${
                            order.delivery_status === "delivered"
                              ? "bg-green-500/10 text-green-400 border-green-500/30"
                              : order.delivery_status === "pending"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : order.delivery_status === "shipped"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : order.delivery_status === "cancelled"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : "bg-yellow-500/10 text-yellow-400 border-yellow-500/30"
                          }`}
                        >
                          {order.delivery_status || "Unknown"}
                        </span>

                      </td>

                      {/* Payment */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="text-gray-300">
                          {order.payment_method || "—"}
                        </span>

                      </td>

                      {/* Created At */}
                      <td className="px-5 sm:px-6 py-4 sm:py-5 whitespace-nowrap">

                        <span className="text-sm text-gray-400">
                          {order.created_at
                            ? new Date(
                                order.created_at
                              ).toLocaleDateString("en-IN")
                            : "—"}
                        </span>

                      </td>

                      {/* Action */}
                      <td className="px-5 sm:px-8 py-4 sm:py-5">

                        <div className="flex items-center justify-center">

                          <Link
                            to={`/order-details/${order.id}`}
                            className="w-10 h-10 rounded-xl bg-black border border-gray-700 text-gray-300 hover:bg-[#D4AF37] hover:text-black hover:border-[#D4AF37] transition-all flex items-center justify-center text-lg"
                            title="View Order"
                          >
                            <FaEye size={18} />
                          </Link>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="8"
                      className="px-6 py-16 text-center"
                    >

                      <div className="flex flex-col items-center justify-center">

                        <div className="w-16 h-16 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-2xl mb-4">
                          📦
                        </div>

                        <h3 className="text-lg font-semibold text-white">
                          No Orders Found
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                          Try changing your search or status filter.
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
                    handlePageChange(currentPage - 1)
                  }
                  className="px-3 sm:px-4 py-2.5 bg-black border border-gray-700 rounded-xl text-sm font-medium text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37] transition"
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex flex-wrap justify-center gap-2">

                  {[...Array(totalPages)].map((_, i) => (

                    <button
                      key={i}
                      onClick={() =>
                        handlePageChange(i + 1)
                      }
                      className={`min-w-[42px] px-3 py-2.5 rounded-xl border text-sm font-semibold transition ${
                        currentPage === i + 1
                          ? "bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-[#D4AF37]/10"
                          : "bg-black text-gray-300 border-gray-700 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:text-[#D4AF37]"
                      }`}
                    >
                      {i + 1}
                    </button>

                  ))}

                </div>

                {/* Next */}
                <button
                  disabled={
                    currentPage === totalPages ||
                    totalPages === 0
                  }
                  onClick={() =>
                    handlePageChange(currentPage + 1)
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

export default Orders;