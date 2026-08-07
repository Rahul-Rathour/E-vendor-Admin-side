import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import {
  FaEye,
  FaCheck,
  FaTimes,
  FaTruck,
  FaClipboardCheck,
} from "react-icons/fa";

const ReturnOrders = () => {
  const [returns, setReturns] = useState([]);
  const [filteredReturns, setFilteredReturns] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [returnsPerPage, setReturnsPerPage] = useState(10);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  // =========================================================
  // FETCH RETURN REQUESTS
  // =========================================================
  const fetchReturns = async () => {
    try {
      setLoading(true);

      const response = await api.get("admin/returns");

      if (response.data.status) {
        setReturns(response.data.data || []);
        setFilteredReturns(response.data.data || []);
      } else {
        toast.error("Failed to load return requests");
      }
    } catch (error) {
      console.error("Error fetching return requests:", error);
      toast.error("Failed to load return requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturns();
  }, []);

  // =========================================================
  // SEARCH + FILTER
  // =========================================================
  useEffect(() => {
    let result = [...returns];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((item) => {
        const orderNumber =
          item.order?.order_number?.toLowerCase() || "";

        const userName =
          item.user?.name?.toLowerCase() || "";

        const userEmail =
          item.user?.email?.toLowerCase() || "";

        const productName =
          item.order_item?.product?.name?.toLowerCase() || "";

        const reason =
          item.reason?.toLowerCase() || "";

        return (
          orderNumber.includes(query) ||
          userName.includes(query) ||
          userEmail.includes(query) ||
          productName.includes(query) ||
          reason.includes(query)
        );
      });
    }

    if (statusFilter) {
      result = result.filter(
        (item) => item.status === statusFilter
      );
    }

    setFilteredReturns(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, returns]);

  // =========================================================
  // PAGINATION
  // =========================================================
  const indexOfLastReturn = currentPage * returnsPerPage;
  const indexOfFirstReturn = indexOfLastReturn - returnsPerPage;

  const currentReturns = filteredReturns.slice(
    indexOfFirstReturn,
    indexOfLastReturn
  );

  const totalPages = Math.ceil(
    filteredReturns.length / returnsPerPage
  );

  // =========================================================
  // UPDATE RETURN STATUS
  // =========================================================
  const updateReturnStatus = async (id, action, remarks = "") => {
    try {
      setProcessingId(id);

      let response;

      if (action === "approve") {
        response = await api.put(`admin/returns/${id}/approve`);
      }

      if (action === "reject") {
        response = await api.put(`admin/returns/${id}/reject`, {
          remarks: remarks,
        });
      }

      if (action === "pickup") {
        response = await api.put(`admin/returns/${id}/pickup`);
      }

      if (action === "complete") {
        response = await api.put(`admin/returns/${id}/complete`);
      }

      if (response?.data?.status) {
        toast.success(
          response.data.message || "Return status updated successfully."
        );

        // Refresh list
        await fetchReturns();
      } else {
        toast.error(
          response?.data?.message ||
            "Failed to update return status."
        );
      }
    } catch (error) {
      console.error("Return status update error:", error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong while updating return."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // =========================================================
  // APPROVE
  // =========================================================
  const handleApprove = (id) => {
    const confirmApprove = window.confirm(
      "Are you sure you want to approve this return request?"
    );

    if (!confirmApprove) return;

    updateReturnStatus(id, "approve");
  };

  // =========================================================
  // REJECT
  // =========================================================
  const handleReject = (id) => {
    const remarks = window.prompt(
      "Enter reason for rejecting this return:"
    );

    if (remarks === null) return;

    if (!remarks.trim()) {
      toast.error("Please enter rejection remarks.");
      return;
    }

    updateReturnStatus(id, "reject", remarks);
  };

  // =========================================================
  // PICKUP
  // =========================================================
  const handlePickup = (id) => {
    const confirmPickup = window.confirm(
      "Are you sure the returned product has been picked up?"
    );

    if (!confirmPickup) return;

    updateReturnStatus(id, "pickup");
  };

  // =========================================================
  // COMPLETE
  // =========================================================
  const handleComplete = (id) => {
    const confirmComplete = window.confirm(
      "Are you sure you want to complete this return?"
    );

    if (!confirmComplete) return;

    updateReturnStatus(id, "complete");
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================
  const getStatusClass = (status) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-700";

      case "approved":
        return "bg-blue-100 text-blue-700";

      case "picked_up":
        return "bg-purple-100 text-purple-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // =========================================================
  // STATUS LABEL
  // =========================================================
  const getStatusLabel = (status) => {
    switch (status) {
      case "requested":
        return "Requested";

      case "approved":
        return "Approved";

      case "picked_up":
        return "Picked Up";

      case "completed":
        return "Completed";

      case "rejected":
        return "Rejected";

      default:
        return status || "Unknown";
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================
  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // RETURN ACTIONS
  // =========================================================
  const renderActions = (returnItem) => {
    const id = returnItem.id;
    const status = returnItem.status;

    const isProcessing = processingId === id;

    return (
      <div className="flex items-center justify-center gap-2 flex-wrap">

        {/* REQUESTED */}
        {status === "requested" && (
          <>
            <button
              disabled={isProcessing}
              onClick={() => handleApprove(id)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition disabled:opacity-50"
              title="Approve Return"
            >
              <FaCheck size={14} />
              Approve
            </button>

            <button
              disabled={isProcessing}
              onClick={() => handleReject(id)}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl transition disabled:opacity-50"
              title="Reject Return"
            >
              <FaTimes size={14} />
              Reject
            </button>
          </>
        )}

        {/* APPROVED */}
        {status === "approved" && (
          <button
            disabled={isProcessing}
            onClick={() => handlePickup(id)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition disabled:opacity-50"
            title="Mark Picked Up"
          >
            <FaTruck size={14} />
            Pickup
          </button>
        )}

        {/* PICKED UP */}
        {status === "picked_up" && (
          <button
            disabled={isProcessing}
            onClick={() => handleComplete(id)}
            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl transition disabled:opacity-50"
            title="Complete Return"
          >
            <FaClipboardCheck size={14} />
            Complete
          </button>
        )}

        {/* COMPLETED */}
        {status === "completed" && (
          <span className="text-green-600 text-sm font-semibold">
            Completed
          </span>
        )}

        {/* REJECTED */}
        {status === "rejected" && (
          <span className="text-red-600 text-sm font-semibold">
            Rejected
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <div className="mb-6">

        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Return Orders
        </h1>

        <p className="text-gray-500 mt-1">
          Manage and process customer return requests
        </p>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">

        <div className="flex gap-3 flex-wrap">

          {/* ITEMS PER PAGE */}
          <select
            value={returnsPerPage}
            onChange={(e) => {
              setReturnsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 bg-white rounded-2xl px-4 py-3 focus:border-orange-500 focus:outline-none"
          >
            <option value={5}>Show 5</option>
            <option value={10}>Show 10</option>
            <option value={20}>Show 20</option>
            <option value={50}>Show 50</option>
          </select>

          {/* STATUS */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 bg-white rounded-2xl px-4 py-3 focus:border-orange-500 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="requested">Requested</option>
            <option value="approved">Approved</option>
            <option value="picked_up">Picked Up</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

        </div>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search order, customer, product..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full md:w-96 border border-gray-300 bg-white rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
        />

      </div>

      {/* =====================================================
          RETURN TABLE
      ===================================================== */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="min-w-full">

            <thead className="bg-orange-50">

              <tr>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Order Number
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Customer
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Product
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Qty
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Amount
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Reason
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                  Requested At
                </th>

                <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">
                  Action
                </th>

              </tr>

            </thead>

            <tbody className="divide-y">

              {loading ? (

                <tr>
                  <td
                    colSpan="9"
                    className="text-center py-16 text-gray-500"
                  >
                    Loading return requests...
                  </td>
                </tr>

              ) : currentReturns.length > 0 ? (

                currentReturns.map((returnItem) => (

                  <tr
                    key={returnItem.id}
                    className="hover:bg-orange-50 transition"
                  >

                    {/* ORDER NUMBER */}
                    <td className="px-6 py-5 font-medium text-gray-800">
                      {returnItem.order?.order_number || `#${returnItem.order_id}`}
                    </td>

                    {/* CUSTOMER */}
                    <td className="px-6 py-5">

                      <div className="flex flex-col">

                        <span className="font-medium text-gray-800">
                          {returnItem.user?.name || `User #${returnItem.user_id}`}
                        </span>

                        {returnItem.user?.email && (
                          <span className="text-xs text-gray-500">
                            {returnItem.user.email}
                          </span>
                        )}

                      </div>

                    </td>

                    {/* PRODUCT */}
                    <td className="px-6 py-5">

                      <div className="flex items-center gap-3 min-w-[220px]">

                        {returnItem.order_item?.product?.image ? (

                          <img
                            src={`${process.env.REACT_APP_API_URL}/public/${returnItem.order_item.product.image}`}
                            alt={
                              returnItem.order_item.product.name ||
                              "Product"
                            }
                            className="w-12 h-12 rounded-xl object-cover border"
                          />

                        ) : (

                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                            N/A
                          </div>

                        )}

                        <div>

                          <p className="font-medium text-gray-800">
                            {returnItem.order_item?.product?.name ||
                              "Product unavailable"}
                          </p>

                          <p className="text-xs text-gray-500">
                            Item #{returnItem.order_item_id}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* QUANTITY */}
                    <td className="px-6 py-5 text-gray-700">
                      {returnItem.order_item?.quantity || "-"}
                    </td>

                    {/* AMOUNT */}
                    <td className="px-6 py-5 font-semibold text-gray-800">
                      ₹
                      {returnItem.order_item?.price
                        ? Number(
                            returnItem.order_item.price
                          ).toLocaleString("en-IN")
                        : "0"}
                    </td>

                    {/* REASON */}
                    <td className="px-6 py-5 max-w-[220px]">

                      <div className="truncate text-gray-700">
                        {returnItem.reason || "-"}
                      </div>

                      {returnItem.remarks && (
                        <div
                          className="text-xs text-gray-500 truncate mt-1"
                          title={returnItem.remarks}
                        >
                          {returnItem.remarks}
                        </div>
                      )}

                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">

                      <span
                        className={`px-4 py-1.5 text-xs font-medium rounded-2xl whitespace-nowrap ${getStatusClass(
                          returnItem.status
                        )}`}
                      >
                        {getStatusLabel(returnItem.status)}
                      </span>

                    </td>

                    {/* CREATED AT */}
                    <td className="px-6 py-5 text-sm text-gray-500 whitespace-nowrap">
                      {formatDate(returnItem.created_at)}
                    </td>

                    {/* ACTION */}
                    <td className="px-8 py-5 text-center">

                      {renderActions(returnItem)}

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td
                    colSpan="9"
                    className="text-center py-16 text-gray-500"
                  >
                    No return requests found.
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
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-8 px-2">

        <span className="text-sm text-gray-600">

          Showing{" "}
          {filteredReturns.length === 0
            ? 0
            : indexOfFirstReturn + 1}{" "}
          to{" "}
          {Math.min(
            indexOfLastReturn,
            filteredReturns.length
          )}{" "}
          of {filteredReturns.length} return requests

        </span>

        <div className="flex gap-3 items-center">

          <button
            disabled={currentPage === 1}
            onClick={() =>
              setCurrentPage((prev) => prev - 1)
            }
            className="px-6 py-3 border border-gray-300 bg-white rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Previous
          </button>

          <span className="px-6 py-3 bg-orange-100 text-orange-700 font-medium rounded-2xl whitespace-nowrap">
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={
              currentPage === totalPages ||
              totalPages === 0
            }
            onClick={() =>
              setCurrentPage((prev) => prev + 1)
            }
            className="px-6 py-3 border border-gray-300 bg-white rounded-2xl disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
};

export default ReturnOrders;