import React, { useState, useEffect } from "react";
import { FaEye, FaShoppingCart, FaTruck, FaCheckCircle, FaClock } from "react-icons/fa";
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
import api from "../api";

const Dashboard = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [pendingRes, shippedRes, deliveredRes, recentRes, topRes] = await Promise.all([
          api.get("orders/pending"),
          api.get("orders/shipped"),
          api.get("orders/delivered"),
          api.get("recent-orders"),
          api.get("top-delivered-items"),
        ]);

        const pending = pendingRes.data?.data?.length || 0;
        const shipped = shippedRes.data?.data?.length || 0;
        const delivered = deliveredRes.data?.data?.length || 0;

        setOrderStats({
          pending,
          shipped,
          delivered,
          total: pending + shipped + delivered,
        });

        setRecentOrders(recentRes.data?.data || []);

        const formattedTop = (topRes.data?.data || []).map((item) => ({
          name: item.name?.substring(0, 18) + "...",
          value: Number(item.total_sold || 0),
        }));

        setTopProducts(formattedTop);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const barData = [
    { month: "Jan", Fresh: 10, Cooking: 20, Drinks: 30, Organic: 15 },
    { month: "Feb", Fresh: 25, Cooking: 15, Drinks: 10, Organic: 20 },
    { month: "Mar", Fresh: 30, Cooking: 20, Drinks: 25, Organic: 10 },
    { month: "Apr", Fresh: 40, Cooking: 30, Drinks: 15, Organic: 25 },
  ];

  const pieData = topProducts.length > 0 ? topProducts : [{ name: "No Data", value: 1 }];

  const PALETTE = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];

  return (
    <div className="min-h-screen bg-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl px-8 py-8 text-white mb-8">
          <h1 className="text-4xl font-bold">Dashboard Overview</h1>
          <p className="text-orange-100 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
        </div> */}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Total Orders", value: orderStats.total, icon: <FaShoppingCart />, color: "orange" },
            { label: "Pending", value: orderStats.pending, icon: <FaClock />, color: "yellow" },
            { label: "Shipping", value: orderStats.shipped, icon: <FaTruck />, color: "blue" },
            { label: "Delivered", value: orderStats.delivered, icon: <FaCheckCircle />, color: "green" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-800 mt-2">
                    {loading ? "..." : stat.value}
                  </h3>
                </div>
                <div className={`text-4xl ${stat.color === "orange" ? "text-orange-500" : ""} 
                  ${stat.color === "yellow" ? "text-yellow-500" : ""} 
                  ${stat.color === "blue" ? "text-blue-500" : ""} 
                  ${stat.color === "green" ? "text-green-500" : ""}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 border border-orange-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Sales Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Fresh" fill="#f97316" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Cooking" fill="#fb923c" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Drinks" fill="#fdba74" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Organic" fill="#fed7aa" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 border border-orange-300">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Top Selling Products</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    dataKey="value"
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-orange-100 flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-800">Recent Orders</h3>
            <Link
              to="/orders"
              className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-2"
            >
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-orange-50 text-gray-600">
                <tr>
                  <th className="px-8 py-4 text-left font-medium">Order ID</th>
                  <th className="px-6 py-4 text-left font-medium">Date</th>
                  <th className="px-6 py-4 text-left font-medium">Customer</th>
                  <th className="px-6 py-4 text-left font-medium">Amount</th>
                  <th className="px-6 py-4 text-left font-medium">Status</th>
                  <th className="px-8 py-4 text-center font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-12 text-gray-400">
                      No recent orders found
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-orange-50 transition">
                      <td className="px-8 py-5 font-medium text-gray-800">
                        #{order.order_number || order.id}
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-6 py-5 text-gray-600">
                        {order.customer_name || "Walk-in Customer"}
                      </td>
                      <td className="px-6 py-5 font-semibold text-gray-800">
                        ₹{order.total_amount || 0}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                            order.delivery_status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.delivery_status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {order.delivery_status?.toUpperCase() || "PENDING"}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <Link
                          to={`/order-details/${order.id}`}
                          className="inline-flex items-center justify-center w-9 h-9 bg-orange-100 hover:bg-orange-200 text-orange-600 rounded-2xl transition"
                        >
                          <FaEye />
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
    </div>
  );
};

export default Dashboard;