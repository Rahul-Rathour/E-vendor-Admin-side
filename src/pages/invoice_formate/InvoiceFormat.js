import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const InvoiceFormat = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const invoiceData = location.state?.invoiceData;

    if (!invoiceData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-red-600">No Invoice Data Found</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-800"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { customer, items, invoiceType, subtotal, totalGST, grandTotal, invoice_number } = invoiceData;

    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Top Navigation - Hidden during print */}
            <div className="max-w-4xl mx-auto px-4 mb-6 flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-2xl font-medium transition"
                >
                    ← Back
                </button>
                <button
                    onClick={handlePrint}
                    className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold flex items-center gap-2 transition shadow-lg"
                >
                    🖨️ Print / Save as PDF
                </button>
            </div>

            {/* Main Invoice Container */}
            <div id="invoice" className="max-w-4xl mx-auto bg-white shadow-2xl overflow-hidden print:shadow-none">
                <div className="border-[12px] border-green-600 p-10 min-h-[297mm] relative">

                    {/* Header */}
                    <div className="flex justify-between items-start mb-10">
                        <div className="flex items-start gap-5">
                            {/* Logo */}
                            <div className="w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center text-4xl shadow-inner flex-shrink-0">
                                📄
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Your Company</h1>
                                <p className="text-sm text-gray-600 mt-1">
                                    123, Business Street, Bareilly, U.P. 243001
                                </p>
                                <p className="text-sm text-gray-600">GSTIN: 09XXXXXXXXXXXXX</p>
                                <p className="text-sm text-gray-600">
                                    +91 98765 43210 | info@yourcompany.com
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <div className="text-5xl font-bold text-green-600 tracking-widest mb-2">GST INVOICE</div>
                            <div className="space-y-1 text-sm text-right">
                                <p><span className="font-semibold">Invoice No:</span> {invoice_number}</p>
                                <p><span className="font-semibold">Date:</span> {date}</p>
                                <p><span className="font-semibold">Type:</span> {invoiceType.toUpperCase()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Bill To */}
                    <div className="mb-10">
                        <div className="bg-green-600 text-white px-8 py-3 font-semibold inline-block text-lg rounded-tr-xl">
                            BILL TO
                        </div>
                        <div className="border-2 border-green-600 p-8 bg-white">
                            <p className="font-bold text-lg">{customer.name}</p>
                            <p className="mt-1">{customer.phone}</p>
                            {customer.email && <p>{customer.email}</p>}
                            {customer.gstin && <p className="mt-1">GSTIN: {customer.gstin}</p>}
                            <p className="mt-3 leading-relaxed">{customer.billing_address}</p>
                        </div>
                    </div>

                    {/* Products Table */}
                    <table className="w-full border-2 border-green-600 mb-10">
                        <thead>
                            <tr className="bg-green-600 text-white">
                                <th className="border border-green-500 py-4 px-4 text-left w-12">S.No</th>
                                <th className="border border-green-500 py-4 px-4 text-left">PRODUCT</th>
                                <th className="border border-green-500 py-4 px-4 text-left">DESCRIPTION</th>
                                <th className="border border-green-500 py-4 px-4 text-center w-20">QTY</th>
                                <th className="border border-green-500 py-4 px-4 text-right">RATE</th>
                                <th className="border border-green-500 py-4 px-4 text-right">AMOUNT</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((item, index) => (
                                <tr key={index} className="hover:bg-green-50">
                                    <td className="border border-green-200 py-4 px-4 text-center">{index + 1}</td>
                                    <td className="border border-green-200 py-4 px-4 font-medium">{item.name}</td>
                                    <td className="border border-green-200 py-4 px-4 text-gray-500">-</td>
                                    <td className="border border-green-200 py-4 px-4 text-center">{item.quantity}</td>
                                    <td className="border border-green-200 py-4 px-4 text-right">₹{item.price.toFixed(2)}</td>
                                    <td className="border border-green-200 py-4 px-4 text-right font-semibold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals Section */}
                    <div className="flex justify-end mb-10">
                        <div className="w-[380px]">
                            <div className="flex justify-between py-3 border-b border-gray-300">
                                <span className="font-semibold">Subtotal</span>
                                <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-3 border-b border-gray-300">
                                <span className="font-semibold">GST (18%)</span>
                                <span className="font-medium">₹{totalGST.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-6 text-2xl font-bold text-green-700 border-b-2 border-green-600">
                                <span>GRAND TOTAL</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-12">
                        <p className="font-semibold">
                            Amount in Words: <span className="font-normal">Rupees {Math.floor(grandTotal)} Only</span>
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-sm text-gray-600 pt-8 border-t border-gray-300">
                        <p className="font-semibold text-base">Thank You For Your Business!</p>
                        <p>This is a computer generated invoice and does not require signature.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFormat;