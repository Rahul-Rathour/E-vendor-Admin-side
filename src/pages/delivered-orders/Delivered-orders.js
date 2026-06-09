import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const DeliveredOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage, setOrdersPerPage] = useState(10);

  // Fetch Delivered Orders
  const fetchOrders = async () => {
    try {
      const response = await api.get("orders/delivered");
      if (response.data.status) {
        setOrders(response.data.data);
        setFilteredOrders(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching delivered orders:", error);
      toast.error("Failed to load delivered orders");
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
  }, [searchQuery, orders]);

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
        {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Delivered Orders</h1>
          <p className="text-orange-100 mt-2">View all successfully delivered orders</p>
        </div> */}

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
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
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

        {/* Responsive Table Container */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full whitespace-nowrap">
              <thead className="bg-orange-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Order No.</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-4 py-5 text-left text-sm font-semibold text-gray-700">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentOrders.length > 0 ? (
                  currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50 transition">
                      <td className="px-4 py-5 font-medium text-gray-800">{order.order_number}</td>
                      <td className="px-4 py-5 text-gray-600">{order.user_id}</td>
                      <td className="px-4 py-5 font-semibold">₹{order.total_amount}</td>
                      <td className="px-4 py-5 max-w-[200px] truncate">{order.shipping_address}</td>
                      <td className="px-4 py-5">
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-2xl text-xs font-medium">
                          Delivered
                        </span>
                      </td>
                      <td className="px-4 py-5">{order.payment_method || "COD"}</td>
                      <td className="px-4 py-5 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-gray-500">
                      No delivered orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center mt-8 px-2 gap-4">
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

export default DeliveredOrders;