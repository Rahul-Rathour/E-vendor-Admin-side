import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPrint, FaArrowLeft, FaFileInvoiceDollar } from "react-icons/fa";
import api from "../../api";

const Invoice = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [invoice, setInvoice] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchInvoice();
    }, []);

    const fetchInvoice = async () => {
        try {
            const res = await api.get(`/invoice/${id}`);
            const orderData = res.data.order;

            setOrder(orderData);
            setInvoice(orderData.invoice);
            setItems(orderData.items || []);
        } catch (err) {
            console.error("Invoice fetch error:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-orange-50 flex items-center justify-center">
                <p className="text-xl text-gray-600">Loading Invoice...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-orange-50 py-12 px-4">
                <div className="max-w-lg mx-auto text-center">
                    <div className="bg-white rounded-3xl shadow-xl p-10 md:p-16">
                        <div className="w-24 h-24 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center mb-8">
                            <FaFileInvoiceDollar className="text-orange-500 text-5xl" />
                        </div>

                        <h2 className="text-3xl font-bold text-gray-800 mb-3">
                            Invoice Not Available
                        </h2>
                        <p className="text-gray-600 text-lg mb-8">
                            The invoice for this order has not been generated yet or may not exist.
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="w-full flex items-center justify-center gap-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-2xl font-medium transition"
                            >
                                <FaArrowLeft /> Go Back
                            </button>

                            <button
                                onClick={() => navigate('/orders/pending')}
                                className="w-full flex items-center justify-center gap-3 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-medium transition"
                            >
                                View Pending Orders
                            </button>
                        </div>
                    </div>

                    <p className="text-gray-500 mt-6 text-sm">
                        Order ID: #{id}
                    </p>
                </div>
            </div>
        );
    }

    const gstTotal =
        Number(invoice.cgst_amount || 0) +
        Number(invoice.sgst_amount || 0) +
        Number(invoice.igst_amount || 0);

    return (
        <div className="min-h-screen bg-orange-50 py-10 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-bold">Invoice</h1>
                            <p className="text-orange-100 mt-2">#{invoice.invoice_number}</p>
                        </div>
                        <button
                            onClick={() => window.print()}
                            className="flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-2xl font-medium hover:bg-orange-50 transition shadow-sm"
                        >
                            <FaPrint /> Print Invoice
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
                    {/* Invoice & Billing Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details</h3>
                            <div className="space-y-3">
                                <p><span className="font-medium text-gray-600">Invoice No:</span> {invoice.invoice_number}</p>
                                <p><span className="font-medium text-gray-600">Invoice Date:</span> {invoice.invoice_date}</p>
                                <p><span className="font-medium text-gray-600">Order No:</span> {order.order_number}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Billing Information</h3>
                            <div className="space-y-3">
                                <p><span className="font-medium text-gray-600">Billing Name:</span> {invoice.billing_name}</p>
                                <p><span className="font-medium text-gray-600">Billing Address:</span> {invoice.billing_address}</p>
                                <p><span className="font-medium text-gray-600">User Gst:</span> {order.user_gst}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Order Info */}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Shipping Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <p><span className="font-medium text-gray-600">Shipping Address:</span> {order.shipping_address}</p>
                            <p><span className="font-medium text-gray-600">Payment Method:</span> {order.payment_method || "COD"}</p>
                            <p>
                                <span className="font-medium text-gray-600">Status:</span>{" "}
                                <span className="px-4 py-1 bg-yellow-100 text-yellow-700 rounded-2xl text-xs font-medium">
                                    {order.delivery_status}
                                </span>
                            </p>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="mb-10">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-full">
                                <thead>
                                    <tr className="bg-orange-50 border-b">
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Color</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Size</th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Qty</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Price</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">GST</th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {items.map((item) => {
                                        const total = Number(item.price) * Number(item.quantity);
                                        return (
                                            <tr key={item.id} className="hover:bg-orange-50 transition">
                                                <td className="px-6 py-4 font-medium">{item.product?.name}</td>
                                                <td className="px-6 py-4">{item.color?.color_name || '-'}</td>
                                                <td className="px-6 py-4">{item.size || '-'}</td>
                                                <td className="px-6 py-4 text-center">{item.quantity}</td>
                                                <td className="px-6 py-4 text-right">₹{Number(item.price).toFixed(2)}</td>
                                                <td className="px-6 py-4 text-right">{item.gst}%</td>
                                                <td className="px-6 py-4 text-right font-semibold">₹{total.toFixed(2)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end">
                        <div className="w-full md:w-96 bg-orange-50 rounded-2xl p-6">
                            <h3 className="font-semibold text-gray-800 mb-4">Payment Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>₹{Number(order.total_amount).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">GST Total</span>
                                    <span>₹{gstTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping Charges</span>
                                    <span>₹{Number(order.shipping_charges || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Discount</span>
                                    <span className="text-green-600">- ₹{Number(order.discount_amount || 0).toFixed(2)}</span>
                                </div>

                                <hr className="my-3 border-gray-300" />

                                <div className="flex justify-between text-lg font-bold text-gray-800">
                                    <span>Grand Total</span>
                                    <span>₹{Number(invoice.total_amount).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Print Button */}
                <div className="text-center mt-8 md:hidden">
                    <button
                        onClick={() => window.print()}
                        className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-medium flex items-center gap-2 mx-auto"
                    >
                        <FaPrint /> Print Invoice
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Invoice;