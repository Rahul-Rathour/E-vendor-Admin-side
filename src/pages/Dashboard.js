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
import api from "../api";

const Dashboard = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [orderStats, setOrderStats] = useState({
    pending: 0,
    shipped: 0,
    delivered: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch order data
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const [pendingRes, shippedRes, deliveredRes, recentRes, topDeliveredRes] =
          await Promise.all([
            api.get("orders/pending"),
            api.get("orders/shipped"),
            api.get("orders/delivered"),
            api.get("recent-orders"),
            api.get("top-delivered-items"),
          ]);

        setOrderStats({
          pending: pendingRes.data?.data?.length || 0,
          shipped: shippedRes.data?.data?.length || 0,
          delivered: deliveredRes.data?.data?.length || 0,
        });

        setRecentOrders(recentRes.data?.data || []);

        // Format for pie chart
        const formatted = (topDeliveredRes.data?.data || []).map((item) => ({
          name: item.name,
          value: Number(item.total_sold),
        }));

        setTopProducts(formatted);
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const barData = [
    { month: "Jan", Fresh: 10, Cooking: 20, Drinks: 30, Organic: 15 },
    { month: "Feb", Fresh: 25, Cooking: 15, Drinks: 10, Organic: 20 },
    { month: "Mar", Fresh: 30, Cooking: 20, Drinks: 25, Organic: 10 },
    { month: "Apr", Fresh: 40, Cooking: 30, Drinks: 15, Organic: 25 },
  ];

  const pieData = topProducts;

  const PALETTE = ["#4F46E5", "#10B981", "#3B82F6", "#6B7280"];

  return (
    <div className="flex bg-slate-100 min-h-screen overflow-x-hidden w-full">
      <div
        className={`flex-1 transition-all duration-500 px-4 sm:px-6 py-6 w-full max-w-full`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm">Welcome back, Admin 👋</p>
        </div>

        {/* Order Stats (Premium White Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {[
            {
              label: "Total Orders",
              value:
                orderStats.pending +
                orderStats.shipped +
                orderStats.delivered,
            },
            { label: "Pending", value: orderStats.pending },
            { label: "Shipping", value: orderStats.shipped },
            { label: "Delivered", value: orderStats.delivered },
          ].map((stat, i) => (
            <div
              key={i}
              className="p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition"
            >
              <p className="text-xs uppercase tracking-wide text-gray-500">
                {stat.label}
              </p>
              <h3 className="text-2xl font-semibold mt-1 text-gray-800">
                {loading ? "…" : stat.value}
              </h3>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Conversions This Year
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip />
                  <Legend />

                  <Bar dataKey="Fresh" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Cooking" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Drinks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Organic" fill="#6B7280" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Top Revenue Products
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Legend verticalAlign="bottom" />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 overflow-x-auto">
          <h3 className="font-semibold text-gray-700 mb-4">
            Recent Orders
          </h3>

          <table className="w-full min-w-[700px] text-sm text-gray-700">
            <thead className="border-b bg-gray-50 text-gray-500">
              <tr>
                <th className="py-3">Order</th>
                <th>Date</th>
                <th>Address</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="text-center">View</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-gray-400"
                  >
                    No recent orders
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="py-3">{order.order_number || "-"}</td>
                    <td>
                      {order.created_at
                        ? new Date(order.created_at).toDateString()
                        : "-"}
                    </td>
                    <td>{order.shipping_address || "-"}</td>
                    <td>{order.payment_method || "-"}</td>
                    <td className="font-medium">
                      ${order.total_amount}
                    </td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${order.delivery_status === "delivered"
                          ? "bg-green-100 text-green-700"
                          : order.delivery_status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                          }`}
                      >
                        {order.delivery_status}
                      </span>
                    </td>
                    <td className="text-center">
                      <Link
                        to={`/order-details/${order.id}`}
                        className="text-blue-600 hover:text-blue-800"
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
  );
};

export default Dashboard;