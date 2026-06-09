import React, { useState, useEffect } from "react";
import { FaTruck, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api";
import { useNavigate } from "react-router-dom";

const ShippedOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Fetch Shipped Orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("orders/shipped");
      if (response.data.status) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching shipped orders:", error);
      toast.error("Failed to load shipped orders");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Search Filter
  useEffect(() => {
    const filtered = orders.filter((order) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
    setSelectedOrders([]);
    setSelectAll(false);
  }, [searchQuery, orders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Select Handlers
  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map((o) => o.id));
    }
    setSelectAll(!selectAll);
  };

  // Bulk Action
  const handleBulkAction = async (status) => {
    if (selectedOrders.length === 0) {
      toast.warn("No orders selected!");
      return;
    }

    try {
      await Promise.all(
        selectedOrders.map((id) =>
          api.post(`order/update-status/${id}`, { status })
        )
      );
      toast.success(`Selected orders marked as ${status}!`);
      setSelectedOrders([]);
      setSelectAll(false);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update orders");
    }
  };

  // Mark as Delivered
  const handleMarkDelivered = async (id) => {
    try {
      await api.post(`order/update-status/${id}`, { status: "delivered" });
      toast.success("Order marked as Delivered!");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };
  const handleInvoice = (id) => {
    if (!id) {
      toast.error("Invalid Order ID");
      return;
    }
    navigate(`/invoice/${id}`);   // Redirect to Invoice Page
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          {/* <h1 className="text-4xl font-bold">Shipped Orders</h1> */}
          <p className="text-orange-100 mt-2">Track and manage shipped orders</p>
        </div>

        {/* Filters & Bulk Actions */}
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
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              onClick={() => handleBulkAction("delivered")}
              disabled={selectedOrders.length === 0}
              className="px-5 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaTruck /> Mark Selected as Delivered
            </button>
          </div>

          <input
            type="text"
            placeholder="Search by order number or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Order Number</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Created At</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Action</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50 transition">
                      <td className="px-6 py-5">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                        />
                      </td>
                      <td className="px-6 py-5 font-medium">{order.order_number}</td>
                      <td className="px-6 py-5 text-gray-600">{order.user_id}</td>
                      <td className="px-6 py-5 font-semibold">₹{order.total_amount}</td>
                      <td className="px-6 py-5 max-w-xs truncate">{order.shipping_address}</td>
                      <td className="px-6 py-5">
                        <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-2xl text-xs font-medium">
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="px-6 py-5">{order.payment_method || "COD"}</td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-8 py-5 text-center">
                        {order.delivery_status === "shipped" && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="text-green-600 hover:text-green-700 transition p-2"
                            title="Mark as Delivered"
                          >
                            <FaTruck size={20} />
                          </button>
                        )}
                      </td>
                      <td className="px-8 py-5 text-center">

                        <button
                          onClick={() => handleInvoice(order.id)}
                          className="text-green-600 hover:text-green-700 transition p-2"
                          title="View Invoice"
                        >
                          <FaFileInvoice size={20} />
                        </button>

                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-500">
                      No shipped orders found.
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

export default ShippedOrders;