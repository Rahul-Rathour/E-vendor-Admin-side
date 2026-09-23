import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaEye, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const PendingCreditPayments = () => {
    const navigate = useNavigate();

    const [payments, setPayments] = useState([]);
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [currentPage, setCurrentPage] = useState(1);
    const [paymentsPerPage, setPaymentsPerPage] = useState(10);
    const [selectedProof, setSelectedProof] = useState(null);

    // ==============================
    // FETCH PENDING PAYMENTS
    // ==============================
    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await api.get("admin/pending-credit-payments");

                if (response.data.status) {
                    setPayments(response.data.data || []);
                    setFilteredPayments(response.data.data || []);
                }
            } catch (error) {
                console.error("Error fetching pending payments:", error);
                toast.error("Failed to load pending payments");
            }
        };

        fetchPayments();
    }, []);

    // ==============================
    // SEARCH
    // ==============================
    useEffect(() => {
        let result = [...payments];

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();

            result = result.filter((payment) => {
                return (
                    String(payment.id || "").toLowerCase().includes(query) ||
                    String(payment.user_id || "").toLowerCase().includes(query) ||
                    String(payment.transaction_id || "")
                        .toLowerCase()
                        .includes(query) ||
                    String(payment.amount || "").toLowerCase().includes(query) ||
                    String(payment.status || "").toLowerCase().includes(query) ||
                    String(payment.dealer?.name || "")
                        .toLowerCase()
                        .includes(query)
                );
            });
        }

        setFilteredPayments(result);
        setCurrentPage(1);
    }, [searchQuery, payments]);

    // ==============================
    // PAGINATION
    // ==============================
    const indexOfLastPayment = currentPage * paymentsPerPage;
    const indexOfFirstPayment = indexOfLastPayment - paymentsPerPage;

    const currentPayments = filteredPayments.slice(
        indexOfFirstPayment,
        indexOfLastPayment
    );

    const totalPages = Math.ceil(
        filteredPayments.length / paymentsPerPage
    );

    const handleApprove = async (id) => {
        try {
            const response = await api.put(
                `/admin/credit-payment/${id}/approve`
            );

            if (response.data.status) {
                toast.success("Payment approved successfully");

                const updatedPayments = payments.filter(
                    (payment) => payment.id !== id
                );

                setPayments(updatedPayments);
                setFilteredPayments(updatedPayments);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to approve payment");
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm("Are you sure you want to reject this payment?")) {
            return;
        }

        try {
            const response = await api.put(
                `/admin/credit-payment/${id}/reject`
            );

            if (response.data.status) {
                toast.success("Payment rejected successfully");

                const updatedPayments = payments.filter(
                    (payment) => payment.id !== id
                );

                setPayments(updatedPayments);
                setFilteredPayments(updatedPayments);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to reject payment");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f6f0] py-6 px-4 sm:px-6 lg:px-8">

            <div className="max-w-7xl mx-auto">

                {/* ==============================
                        HEADER
                    ============================== */}
                <div className="bg-black rounded-2xl shadow-xl mb-6 overflow-hidden">

                    <div className="px-5 sm:px-8 py-6">

                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 mb-5 transition"
                        >
                            <FaArrowLeft />
                            Back
                        </button>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                                    Pending Credit Payments
                                </h1>

                                <p className="text-gray-400 mt-1 text-sm">
                                    Review and manage pending customer credit payments.
                                </p>
                            </div>

                            <div className="bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold">
                                {filteredPayments.length} Pending
                            </div>

                        </div>

                    </div>

                </div>

                {/* ==============================
                        SEARCH + PAGINATION
                    ============================== */}
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-4 mb-6">

                    <div className="flex flex-col md:flex-row gap-4 justify-between">

                        <div className="relative w-full md:max-w-md">

                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

                            <input
                                type="text"
                                placeholder="Search transaction, user ID, amount..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                            />

                        </div>

                        <select
                            value={paymentsPerPage}
                            onChange={(e) => {
                                setPaymentsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
                        >
                            <option value={5}>Show 5</option>
                            <option value={10}>Show 10</option>
                            <option value={20}>Show 20</option>
                            <option value={50}>Show 50</option>
                        </select>

                    </div>

                </div>

                {/* ==============================
                        TABLE
                    ============================== */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

                    <div className="overflow-x-auto">

                        <table className="min-w-[1000px] w-full">

                            <thead className="bg-black">

                                <tr>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        User ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Transaction ID
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Payment Proof
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Status
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Date
                                    </th>

                                    <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                                        Action
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {currentPayments.length > 0 ? (

                                    currentPayments.map((payment) => (

                                        <tr
                                            key={payment.id}
                                            className="hover:bg-yellow-50/50 transition"
                                        >

                                            <td className="px-5 py-4 font-semibold text-gray-800">
                                                #{payment.id}
                                            </td>

                                            <td className="px-5 py-4 text-gray-700">
                                                {payment.user_id}
                                            </td>

                                            <td className="px-5 py-4 font-bold text-gray-900">
                                                ₹{Number(payment.amount || 0).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-5 py-4 text-gray-700">
                                                {payment.transaction_id || "-"}
                                            </td>

                                            <td className="px-5 py-4">
                                                {payment.payment_proof ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}/public/payment_proofs/${payment.payment_proof}`}
                                                        alt="Payment Proof"
                                                        onClick={() =>
                                                            setSelectedProof(
                                                                `${process.env.REACT_APP_API_URL}/public/payment_proofs/${payment.payment_proof}`
                                                            )
                                                        }
                                                        className="w-14 h-14 object-cover rounded-lg border border-gray-300 cursor-pointer hover:scale-105 hover:border-yellow-500 transition shadow-sm"
                                                    />
                                                ) : (
                                                    "-"
                                                )}
                                            </td>

                                            <td className="px-5 py-4">

                                                <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                    {payment.status}
                                                </span>

                                            </td>

                                            <td className="px-5 py-4 text-sm text-gray-500">

                                                {payment.created_at
                                                    ? new Date(payment.created_at).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "-"}

                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex gap-2">

                                                    <button
                                                        onClick={() => handleApprove(payment.id)}
                                                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-lg transition"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        onClick={() => handleReject(payment.id)}
                                                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition"
                                                    >
                                                        Reject
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="text-center py-16 text-gray-500"
                                        >
                                            No pending payments found.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

                {/* ==============================
                        PAGINATION
                    ============================== */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">

                    <p className="text-sm text-gray-600">

                        Showing{" "}
                        {filteredPayments.length === 0
                            ? 0
                            : indexOfFirstPayment + 1}{" "}
                        to{" "}
                        {Math.min(indexOfLastPayment, filteredPayments.length)}{" "}
                        of {filteredPayments.length}

                    </p>

                    <div className="flex gap-2">

                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                            className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
                        >
                            Previous
                        </button>

                        <span className="px-4 py-2 bg-black text-yellow-400 rounded-xl font-semibold">
                            {currentPage} / {totalPages || 1}
                        </span>

                        <button
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            onClick={() => setCurrentPage(currentPage + 1)}
                            className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
                        >
                            Next
                        </button>

                    </div>

                </div>

            </div>
            {/* ==============================
                PAYMENT PROOF IMAGE MODAL
            ============================== */}
            {selectedProof && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    onClick={() => setSelectedProof(null)}
                >
                    <div
                        className="relative max-w-5xl max-h-[90vh] w-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={() => setSelectedProof(null)}
                            className="absolute -top-12 right-0 sm:-right-2 sm:top-0 z-10 w-10 h-10 rounded-full bg-white text-black flex items-center justify-center text-2xl font-bold hover:bg-yellow-400 transition shadow-lg"
                        >
                            ×
                        </button>

                        {/* FULL IMAGE */}
                        <img
                            src={selectedProof}
                            alt="Payment Proof"
                            className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl bg-white"
                        />
                    </div>
                </div>
            )}

        </div>
    );
};

export default PendingCreditPayments;