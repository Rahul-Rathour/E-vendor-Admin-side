import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import {
  BarChart,
  PieChart,
  Bar,
  Pie,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import SidebarMenu from "../components/SidebarMenu";
import api from "../api";

const Dashboard = () => {
  const [recentOrders, setRecentOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch order data from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const [pendingRes, shippedRes, deliveredRes, recentRes] = await Promise.all([
          api.get("orders/pending"),
          api.get("orders/shipped"),
          api.get("orders/delivered"),
          api.get("recent-orders"),
        ]);

        setOrderStats({
          pending: pendingRes.data?.data?.length || 0,
          shipped: shippedRes.data?.data?.length || 0,
          delivered: deliveredRes.data?.data?.length || 0,
        });
        setRecentOrders(recentRes.data?.data || []);
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Example Chart Data
  const barData = [
    { month: "Jan", Fresh: 10, Cooking: 20, Drinks: 30, Organic: 15 },
    { month: "Feb", Fresh: 25, Cooking: 15, Drinks: 10, Organic: 20 },
    { month: "Mar", Fresh: 30, Cooking: 20, Drinks: 25, Organic: 10 },
    { month: "Apr", Fresh: 40, Cooking: 30, Drinks: 15, Organic: 25 },
  ];

  const pieData = [
    { name: "Fresh Vegetable", value: 400 },
    { name: "Cooking Essentials", value: 300 },
    { name: "Drinks", value: 200 },
    { name: "Organic Food", value: 100 },
  ];

  const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#10b981"];

  return (
    <div className="flex bg-gray-50 min-h-screen relative">
      {/* Sidebar */}
      <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} />

      {/* Dashboard Content */}
      <div
        className={`flex-1 transition-all duration-500 p-4 sm:p-6 md:p-8 ${sidebarOpen ? "ml-60" : "ml-16"
          }`}
      >
        {/* Top Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-500 text-white rounded-xl p-5 text-center shadow-md">
            <h2 className="text-lg">Today Order</h2>
            <p className="text-2xl font-bold">$300</p>
          </div>
          <div className="bg-blue-500 text-white rounded-xl p-5 text-center shadow-md">
            <h2 className="text-lg">This Month</h2>
            <p className="text-2xl font-bold">$5000</p>
          </div>
          <div className="bg-emerald-600 text-white rounded-xl p-5 text-center shadow-md">
            <h2 className="text-lg">Total Order</h2>
            <p className="text-2xl font-bold">$95000</p>
          </div>
        </div>

        {/* Middle Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Total Orders</p>
            <h3 className="text-xl font-semibold mt-1">
              {orderStats.pending + orderStats.shipped + orderStats.delivered}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Pending</p>
            <h3 className="text-xl font-semibold mt-1">
              {loading ? "..." : orderStats.pending}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Under Shipping</p>
            <h3 className="text-xl font-semibold mt-1">
              {loading ? "..." : orderStats.shipped}
            </h3>
          </div>

          <div className="bg-white p-4 rounded-xl shadow text-center">
            <p className="text-gray-500 text-sm">Delivered</p>
            <h3 className="text-xl font-semibold mt-1">
              {loading ? "..." : orderStats.delivered}
            </h3>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Bar Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Conversions This Year</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Fresh" stackId="a" fill="#22c55e" />
                  <Bar dataKey="Cooking" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="Drinks" stackId="a" fill="#f97316" />
                  <Bar dataKey="Organic" stackId="a" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold mb-4">Top Revenue Product</h3>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius="80%" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend layout="horizontal" verticalAlign="bottom" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders (Placeholder) */}
        <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
          <h3 className="font-semibold mb-4">Recent Orders</h3>
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-3">Order Number</th>
                <th>Order Time</th>
                <th>Delivery</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th>View Order</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    No recent orders found.
                  </td>
                </tr>
              ) : (
                recentOrders.map((order, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-3">
                      {order.order_number || "-"}
                    </td>
                    <td>
                      {order.created_at ? new Date(order.created_at).toDateString() : "-"}
                    </td>

                    <td>{order.shipping_address || "-"}</td>
                    <td>{order.payment_method || "-"}</td>
                    <td>${order.total_amount || "0.00"}</td>

                    <td>
                      <span
                        className={`font-semibold ${order.delivery_status === "delivered"
                          ? "text-green-600"
                          : order.delivery_status === "pending"
                            ? "text-yellow-600"
                            : "text-blue-600"
                          }`}
                      >
                        {order.delivery_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/order-details/${order.id}`}
                        className="text-blue-600 hover:text-blue-800 transition duration-300"
                        title="View Order"
                      >
                        <FaEye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
