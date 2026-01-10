import React, { useState, useEffect } from "react";
import { FaEye } from "react-icons/fa";
import { Link } from "react-router-dom";
import linechart from "../images/line.png"
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
  const [topProducts, setTopProducts] = useState([]);
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

        const [pendingRes, shippedRes, deliveredRes, recentRes, topDeliveredRes] = await Promise.all([
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

        // 🔥 Transform backend data → Recharts format
        const pieFormatted = (topDeliveredRes.data?.data || []).map(item => ({
          name: item.name,
          value: Number(item.total_sold),
        }));

        setTopProducts(pieFormatted);

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

  const pieData = topProducts;


  const COLORS = ["#22c55e", "#3b82f6", "#f97316", "#10b981"];

  return (
    <div className="flex bg-slate-100 min-h-screen">
      {/* Sidebar */}
      <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} />

      {/* Dashboard Content */}
      <div
        className={`flex-1 transition-all duration-500 px-6 py-6 ${sidebarOpen ? "ml-60" : "ml-16"
          }`}
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 text-sm">
            Welcome back, Admin 👋
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">

          {/* CARD 1 */}
          <div className="relative p-4 rounded-lg bg-gradient-to-r from-[#4c8df5] to-[#8ce0ff] text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">$2156</h2>
                <p className="text-xs opacity-90 mt-0.5">Total Tax</p>
              </div>

              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 opacity-90"
                fill="none"
                viewBox="0 0 24 24"
                stroke="white"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="mt-3">
              <img
                src={linechart}
                alt="chart"
                className="w-full h-10  opacity-100"
              />
            </div>
          </div>

          {/* CARD 2 */}
          <div className="relative p-4 rounded-lg shadow-md bg-gradient-to-r from-pink-500 to-orange-400 text-white min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">$1567</h2>
                <p className="text-xs opacity-90 mt-0.5">Total Earning</p>
              </div>
              <span className="text-xl opacity-90">📦</span>
            </div>

            <div className="mt-3">
              <img src={linechart} alt="chart" className="w-full h-10  opacity-100" />
            </div>
          </div>

          {/* CARD 3 */}
          <div className="relative p-4 rounded-lg shadow-md bg-gradient-to-r from-green-500 to-teal-400 text-white min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">$4566</h2>
                <p className="text-xs opacity-90 mt-0.5">Total Sales</p>
              </div>
              <span className="text-xl opacity-90">⚗️</span>
            </div>

            <div className="mt-3">
              <img src={linechart} alt="chart" className="w-full h-10  opacity-100" />
            </div>
          </div>

          {/* CARD 4 */}
          <div className="relative p-4 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-pink-500 text-white min-h-[120px]">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">$4566</h2>
                <p className="text-xs opacity-90 mt-0.5">Total Sales</p>
              </div>
              <span className="text-xl opacity-90">$</span>
            </div>

            <div className="mt-3">
              <img src={linechart} alt="chart" className="w-full h-10  opacity-100" />
            </div>
          </div>

        </div>



        {/* Order Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-10">

          {[
            {
              label: "Total Orders",
              value:
                orderStats.pending +
                orderStats.shipped +
                orderStats.delivered,
              gradient: "from-[#4c8df5] to-[#8ce0ff]", // blue → cyan
            },
            {
              label: "Pending",
              value: orderStats.pending,
              gradient: "from-pink-500 to-orange-400", // pink → orange
            },
            {
              label: "Shipping",
              value: orderStats.shipped,
              gradient: "from-green-500 to-teal-400", // green → teal
            },
            {
              label: "Delivered",
              value: orderStats.delivered,
              gradient: "from-purple-500 to-pink-500", // purple → pink
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`relative p-4 rounded-lg bg-gradient-to-r ${stat.gradient} text-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] min-h-[110px] flex flex-col justify-center`}
            >
              <p className="text-sm opacity-90">{stat.label}</p>

              <h3 className="text-xl font-semibold mt-1">
                {loading ? "…" : stat.value}
              </h3>
            </div>
          ))}

        </div>


        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Bar Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Conversions This Year
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  {/* Gradient Definitions */}
                  <defs>
                    <linearGradient id="gradPurple" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>

                    <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>

                    <linearGradient id="gradSky" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0EA5E9" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>

                    <linearGradient id="gradPink" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D946EF" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                  </defs>

                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />

                  {/* Apply gradients here */}
                  <Bar dataKey="Fresh" stackId="a" fill="url(#gradPurple)" />
                  <Bar dataKey="Cooking" stackId="a" fill="url(#gradBlue)" />
                  <Bar dataKey="Drinks" stackId="a" fill="url(#gradSky)" />
                  <Bar dataKey="Organic" stackId="a" fill="url(#gradPink)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-700 mb-4">
              Top Revenue Products
            </h3>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {/* Pie gradients */}
                  <defs>
                    <linearGradient id="piePurple" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>

                    <linearGradient id="pieBlue" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>

                    <linearGradient id="pieSky" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>

                    <linearGradient id="piePink" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#D946EF" />
                      <stop offset="100%" stopColor="#F43F5E" />
                    </linearGradient>
                  </defs>

                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    dataKey="value"
                    label
                  >
                    {pieData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={[
                          "url(#piePurple)",
                          "url(#pieBlue)",
                          "url(#pieSky)",
                          "url(#piePink)",
                        ][i % 4]}
                      />
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
        <div className="bg-white rounded-2xl shadow-sm p-6 overflow-x-auto">
          <h3 className="font-semibold text-gray-700 mb-4">
            Recent Orders
          </h3>

          <table className="w-full min-w-[700px] text-sm">
            <thead className="border-b">
              <tr className="text-gray-500 text-left">
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
                    <td className="py-3">
                      {order.order_number || "-"}
                    </td>
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
