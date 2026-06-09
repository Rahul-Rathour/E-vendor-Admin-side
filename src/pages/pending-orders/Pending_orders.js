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

  // Fetch functions
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

  // Search & Filter
  useEffect(() => {
    let result = orders.filter((order) =>
      order.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredOrders(result);
    setCurrentPage(1);
    setSelectedOrders([]);
    setSelectAll(false);
  }, [searchQuery, orders]);

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Select Handlers
  const handleSelectOrder = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((oid) => oid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) setSelectedOrders([]);
    else setSelectedOrders(currentOrders.map((o) => o.id));
    setSelectAll(!selectAll);
  };

  // Assign Delivery Partner
  const handleAssignPartner = async (orderId, partnerId, trackingId) => {
    if (!partnerId) return;
    try {
      await api.put(`orders/${orderId}/assign-partner`, { delivery_partner_id: partnerId, tracking_id: trackingId });
      toast.success("Delivery partner assigned successfully!");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to assign delivery partner");
    }
  };

  const handleMarkShipped = async (id) => {
    try {
      await api.post(`order/update-status/${id}`, { status: "shipped" });
      await api.get(`/invoice/generate/${id}`);
      toast.success("Order marked as shipped!");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleMarkCancelled = async (id) => {
    try {
      await api.post(`order/update-status/${id}`, { status: "cancelled" });
      toast.success("Order marked as cancelled!");
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleBulkAction = async (status) => {
    if (selectedOrders.length === 0) {
      toast.warn("No orders selected!");
      return; 
    }
    try { 
      await Promise.all(
        selectedOrders.map((id) => api.post(`order/update-status/${id}`, { status })),
        selectedOrders.map((id) => api.get(`/invoice/generate/${id}`))
      );
      toast.success(`Selected orders marked as ${status}!`);
      setSelectedOrders([]);
      setSelectAll(false);
      fetchOrders();
    } catch (err) {
      toast.error("Failed to update orders");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <p className="text-orange-100 mt-2">Manage orders awaiting processing</p>
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
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
              <option value={50}>50 per page</option>
            </select>

            <button
              onClick={() => handleBulkAction("shipped")}
              disabled={selectedOrders.length === 0}
              className="px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaTruck /> Mark Selected as Shipped
            </button>

            <button
              onClick={() => handleBulkAction("cancelled")}
              disabled={selectedOrders.length === 0}
              className="px-5 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaTimes /> Mark Selected as Cancelled
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

        {/* Table - Improved Scroll */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
          <div className="overflow-x-auto">
            <table className="min-w-[1650px] w-full">   {/* ← Increased width */}
              <thead className="bg-orange-50 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-5 text-left w-12">
                    <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />
                  </th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Order Number</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">User ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Address</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Payment</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Created</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700 w-40">Tracking Id</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Delivery Partner</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700 w-40">Actions</th>
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
                      <td className="px-6 py-5 font-medium whitespace-nowrap">{order.order_number}</td>
                      <td className="px-6 py-5 text-gray-600">{order.user_id}</td>
                      <td className="px-6 py-5 font-semibold whitespace-nowrap">₹{order.total_amount}</td>
                      <td className="px-6 py-5 max-w-xs truncate">{order.shipping_address}</td>
                      <td className="px-6 py-5">
                        <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-2xl text-xs font-medium whitespace-nowrap">
                          {order.delivery_status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">{order.payment_method || "COD"}</td>
                      <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </td>


                      <td className="px-6 py-5">
                        <input
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-orange-500 focus:ring-1 min-w-[170px]"
                          value={trackingIds[order.id] || order.tracking_id || ""}
                          onChange={(e) =>
                            setTrackingIds((prev) => ({
                              ...prev,
                              [order.id]: e.target.value,
                            }))
                          }
                        />
                      </td>
                      <td className="px-6 py-5">
                        <select
                          className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:border-orange-500 focus:ring-1 min-w-[170px]"
                          value={order.delivery_partner_id || ""}
                          onChange={(e) => handleAssignPartner(order.id, e.target.value, trackingIds[order.id] || order.tracking_id || "")}
                        >
                          <option value="">-- Select Partner --</option>
                          {deliveryPartners.map((partner) => (
                            <option key={partner.id} value={partner.id}>
                              {partner.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-8 py-5 text-center whitespace-nowrap">
                        <div className="flex justify-center gap-5">
                          <button
                            onClick={() => handleMarkShipped(order.id)}
                            className="text-blue-600 hover:text-blue-700 transition"
                            title="Mark as Shipped"
                          >
                            <FaTruck size={22} />
                          </button>
                          <button
                            onClick={() => handleMarkCancelled(order.id)}
                            className="text-red-600 hover:text-red-700 transition"
                            title="Cancel Order"
                          >
                            <FaTimes size={22} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center py-16 text-gray-500">
                      No pending orders found.
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

export default PendingOrders;