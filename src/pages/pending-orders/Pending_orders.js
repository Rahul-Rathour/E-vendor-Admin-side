import React, { useState, useEffect } from "react";
import { FaTruck } from "react-icons/fa";
import { toast } from "react-toastify";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../api"; // using your existing api.js

const Pending_orders = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("orders/pending");
      if (response.data.status) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle search
  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.shipping_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.delivery_status.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [searchQuery, orders]);

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // ✅ Update Order Status to "shipped"
  const handleMarkShipped = async (id) => {
    try {
      const response = await api.post(`order/update-status/${id}`, { status: "shipped" });
      if (response.data.status) {
        toast.success("Order marked as shipped!");
        fetchOrders(); // Refresh the list after update
      } else {
        toast.error("Failed to update order status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Something went wrong while updating order status.");
    }
  };

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* Sidebar */}
      <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} />

      {/* Dashboard Content */}
      <div
        className={`flex-1 transition-all duration-500 p-4 sm:p-6 md:p-8 ${
          sidebarOpen ? "ml-60" : "ml-16"
        }`}
      >
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
            <h3 className="font-semibold text-xl">Pending Orders</h3>
            <input
              type="text"
              placeholder="Search by order number, address, or status..."
              className="mt-3 sm:mt-0 border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-72 focus:ring-2 focus:ring-blue-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <table className="w-full min-w-[600px] text-left text-sm border">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 border-b">Order Number</th>
                <th className="py-3 px-4 border-b">User ID</th>
                <th className="py-3 px-4 border-b">Total Amount</th>
                <th className="py-3 px-4 border-b">Shipping Address</th>
                <th className="py-3 px-4 border-b">Delivery Status</th>
                <th className="py-3 px-4 border-b">Payment Method</th>
                <th className="py-3 px-4 border-b">Shipping Charges</th>
                <th className="py-3 px-4 border-b">Other Charges</th>
                <th className="py-3 px-4 border-b">Created At</th>
                <th className="py-3 px-4 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3 px-4 font-medium text-gray-700">
                      {order.order_number}
                    </td>
                    <td className="py-3 px-4">{order.user_id}</td>
                    <td className="py-3 px-4">₹{order.total_amount}</td>
                    <td className="py-3 px-4">{order.shipping_address}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.delivery_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.delivery_status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {order.delivery_status}
                      </span>
                    </td>
                    <td className="py-3 px-4">{order.payment_method || "COD"}</td>
                    <td className="py-3 px-4">₹{order.shipping_charges}</td>
                    <td className="py-3 px-4">₹{order.other_charges}</td>
                    <td className="py-3 px-4 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {order.delivery_status === "pending" ? (
                        <button
                          onClick={() => handleMarkShipped(order.id)}
                          className="text-blue-600 hover:text-blue-800 transition"
                          title="Mark as Shipped"
                        >
                          <FaTruck size={18} />
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center py-6 text-gray-500">
                    No pending orders found..
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-end mt-6">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-md border ${
                    currentPage === index + 1
                      ? "bg-blue-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pending_orders;
