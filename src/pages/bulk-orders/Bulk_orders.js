import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";

const Bulk_orders = () => {
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
      result = result.filter((order) =>
        order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery_status?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status Filter
    if (statusFilter) {
      result = result.filter((order) => order.delivery_status === statusFilter);
    }

    setFilteredOrders(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, orders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          {/* <h1 className="text-4xl font-bold">All Orders</h1> */}
          <p className="text-orange-100 mt-2">Manage and track customer orders</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <select
              value={ordersPerPage}
              onChange={(e) => {
                setOrdersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 20</option>
              <option value={50}>Show 50</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <input
            type="text"
            placeholder="Search by order number or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
          />
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Order Number</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Shipping Address</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Created At</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentOrders.filter(order => order.type === 1).length > 0 ? (
                  currentOrders.filter(order => order.type === 1).map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50 transition">
                      <td className="px-6 py-5 font-medium text-gray-800">{order.order_number}</td>
                      <td className="px-6 py-5 text-gray-600">{order.user_id}</td>
                      <td className="px-6 py-5 font-semibold">₹{order.total_amount}</td>
                      <td className="px-6 py-5 max-w-xs truncate">{order.shipping_address}</td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1.5 text-xs font-medium rounded-2xl ${
                            order.delivery_status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.delivery_status === "pending"
                              ? "bg-red-100 text-red-700"
                              : order.delivery_status === "shipped"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="px-6 py-5">{order.payment_method}</td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-8 py-5 text-center">
                        <Link
                          to={`/order-details/${order.id}`}
                          className="inline-flex items-center justify-center w-9 h-9 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-2xl transition"
                          title="View Order"
                        >
                          <FaEye size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-16 text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 px-2">
          <span className="text-sm text-gray-600">
            Showing {indexOfFirstOrder + 1} to{" "}
            {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </span>

          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-orange-100 text-orange-700 font-medium rounded-2xl">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bulk_orders;