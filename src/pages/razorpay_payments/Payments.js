import React, { useState, useEffect } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [paymentsPerPage, setPaymentsPerPage] = useState(10);

  // =====================================================
  // FETCH PAYMENTS
  // =====================================================
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await api.get("razorpay/payments");

        if (response.data.status) {
          // Laravel pagination response:
          // response.data.data.data = actual payment array

          const paymentData = response.data.data?.data || [];

          setPayments(paymentData);
          setFilteredPayments(paymentData);
        }
      } catch (error) {
        console.error("Error fetching payments:", error);
        toast.error("Failed to load payments");
      }
    };

    fetchPayments();
  }, []);

  // =====================================================
  // SEARCH + FILTER
  // =====================================================
  useEffect(() => {
    let result = [...payments];

    // Search
    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();

      result = result.filter(
        (payment) =>
          payment.order_number?.toLowerCase().includes(search) ||
          payment.razorpay_order_id?.toLowerCase().includes(search) ||
          payment.razorpay_payment_id
            ?.toLowerCase()
            .includes(search) ||
          payment.status?.toLowerCase().includes(search) ||
          String(payment.user_id).includes(search)
      );
    }

    // Status filter
    if (statusFilter) {
      result = result.filter(
        (payment) => payment.status === statusFilter
      );
    }

    setFilteredPayments(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, payments]);

  // =====================================================
  // PAGINATION
  // =====================================================
  const indexOfLastPayment = currentPage * paymentsPerPage;
  const indexOfFirstPayment =
    indexOfLastPayment - paymentsPerPage;

  const currentPayments = filteredPayments.slice(
    indexOfFirstPayment,
    indexOfLastPayment
  );

  const totalPages = Math.ceil(
    filteredPayments.length / paymentsPerPage
  );

  // =====================================================
  // PAYMENT STATUS
  // =====================================================
  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "created":
        return "bg-yellow-100 text-yellow-700";

      case "failed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">

        {/* =====================================================
            HEADER
        ===================================================== */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-3xl font-bold">
            Razorpay Payments
          </h1>

          <p className="text-orange-100 mt-2">
            Manage and track online payments
          </p>
        </div>

        {/* =====================================================
            FILTERS
        ===================================================== */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

          <div className="flex gap-3 flex-wrap">

            {/* Records per page */}
            <select
              value={paymentsPerPage}
              onChange={(e) => {
                setPaymentsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 20</option>
              <option value={50}>Show 50</option>
            </select>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
              className="border border-gray-300 rounded-2xl px-4 py-3 bg-white focus:outline-none focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="created">Created</option>
              <option value="failed">Failed</option>
            </select>

          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search payment or order..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(e.target.value)
            }
            className="w-full md:w-96 border border-gray-300 rounded-2xl px-5 py-3 bg-white focus:outline-none focus:border-orange-500"
          />

        </div>

        {/* =====================================================
            PAYMENTS TABLE
        ===================================================== */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-orange-50">

                <tr>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Payment ID
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Order Number
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    User ID
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Razorpay Order ID
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Razorpay Payment ID
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Amount
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Currency
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Created At
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {currentPayments.length > 0 ? (

                  currentPayments.map((payment) => (

                    <tr
                      key={payment.id}
                      className="hover:bg-orange-50 transition"
                    >

                      {/* Payment ID */}
                      <td className="px-6 py-5 font-semibold text-gray-800">
                        #{payment.id}
                      </td>

                      {/* Order Number */}
                      <td className="px-6 py-5 font-medium text-gray-800">
                        {payment.order_number}
                      </td>

                      {/* User ID */}
                      <td className="px-6 py-5 text-gray-600">
                        {payment.user_id}
                      </td>

                      {/* Razorpay Order ID */}
                      <td className="px-6 py-5 text-sm text-gray-600 whitespace-nowrap">
                        {payment.razorpay_order_id || "-"}
                      </td>

                      {/* Razorpay Payment ID */}
                      <td className="px-6 py-5 text-sm text-gray-600 whitespace-nowrap">
                        {payment.razorpay_payment_id || "-"}
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5 font-semibold text-gray-800">
                        ₹
                        {Number(payment.amount || 0).toLocaleString(
                          "en-IN",
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">

                        <span
                          className={`px-4 py-1.5 text-xs font-semibold rounded-2xl capitalize ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          {payment.status}
                        </span>

                      </td>

                      {/* Currency */}
                      <td className="px-6 py-5 text-gray-600">
                        {payment.currency}
                      </td>

                      {/* Created At */}
                      <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">

                        {payment.created_at
                          ? new Date(
                              payment.created_at
                            ).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="9"
                      className="text-center py-16 text-gray-500"
                    >
                      No payments found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* =====================================================
            PAGINATION
        ===================================================== */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 px-2">

          <span className="text-sm text-gray-600">

            {filteredPayments.length > 0
              ? `Showing ${
                  indexOfFirstPayment + 1
                } to ${Math.min(
                  indexOfLastPayment,
                  filteredPayments.length
                )} of ${filteredPayments.length} payments`
              : "Showing 0 payments"}

          </span>

          <div className="flex gap-3">

            {/* Previous */}
            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
              className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            {/* Page */}
            <span className="px-6 py-3 bg-orange-100 text-orange-700 font-medium rounded-2xl">
              Page {currentPage} of {totalPages || 1}
            </span>

            {/* Next */}
            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
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

export default Payments;