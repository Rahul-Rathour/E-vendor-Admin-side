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

    const {
        customer,
        items,
        invoiceType,
        subtotal,
        totalGST,
        discountType,
        discountValue,
        discountAmount,
        grandTotal,
        invoice_number,
        orderNumber,
        orderDate,
        paymentMethod
    } = invoiceData;

    const date = new Date().toLocaleDateString('en-IN', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    const handlePrint = () => {
        window.print();
    };

    const handleDownloadPDF = () => {
        window.print(); // Best native way for clean PDF
        // Alternative: You can install html2pdf.js later for better control
    };

    const handleWhatsAppShare = () => {
        const message = `Hello, here is your invoice from blackhewzen.in%0AInvoice No: ${invoice_number}%0ADate: ${date}%0ASubtotal: ₹${subtotal.toFixed(2)}%0A Discount: ₹${discountAmount.toFixed(2)}%0AGST: ₹${totalGST.toFixed(2)}%0AGrand Total: ₹${grandTotal.toFixed(2)}%0A%0AThank you for shopping with us!`;
        const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${message}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleEmailShare = () => {
        const subject = `Your Invoice - ${invoice_number}`;
        const body = `Dear ${customer.name},\n\nPlease find your invoice details below:\n\nInvoice No: ${invoice_number}\nDate: ${date}\nGrand Total: ₹${grandTotal.toFixed(2)}\n\nThank you for your business!\n\nblackhewzen.in`;
        const mailtoUrl = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(mailtoUrl);
    };
    const totalItemsValue = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {/* Top Controls - Sharing Options */}
            <div className="max-w-4xl mx-auto px-4 mb-6 flex flex-wrap gap-3 justify-between items-center print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2.5 bg-gray-700 hover:bg-gray-800 text-white rounded-2xl font-medium transition"
                >
                    ← Back
                </button>

                <div className="flex flex-wrap gap-3">
                    {/* Download PDF */}
                    <button
                        onClick={handleDownloadPDF}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-medium flex items-center gap-2 transition"
                    >
                        📥 Download PDF
                    </button>

                    {/* WhatsApp Share */}
                    <button
                        onClick={handleWhatsAppShare}
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl font-medium flex items-center gap-2 transition"
                    >
                        💬 WhatsApp
                    </button>

                    {/* Email Share */}
                    <button
                        onClick={handleEmailShare}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-medium flex items-center gap-2 transition"
                    >
                        ✉️ Email
                    </button>

                    {/* Print */}
                    <button
                        onClick={handlePrint}
                        className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-medium flex items-center gap-2 transition"
                    >
                        🖨️ Print
                    </button>
                </div>
            </div>

            {/* Invoice Container - A4 Size Simulation */}
            <div id="invoice" className="max-w-4xl mx-auto bg-white shadow-2xl print:shadow-none">
                <div className="p-8 border border-gray-300 min-h-[297mm] font-sans text-sm">

                    {/* Amazon Header */}
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="text-3xl font-bold text-orange-500">blackhewzen.in</div>
                            <div>
                                <div className="text-lg font-semibold">Tax Invoice/Bill of Supply/Cash Memo</div>
                                <div className="text-xs text-gray-600">(Original for Recipient)</div>
                            </div>
                        </div>

                        {/* QR Code / IRN Placeholder */}
                        <div className="text-right">
                            <div className="w-32 h-32 border-2 border-gray-400 flex items-center justify-center text-xs bg-gray-100">
                                IRN / QR CODE
                            </div>
                            <p className="text-xs mt-1 text-gray-500">IRN: [Your IRN Here]</p>
                        </div>
                    </div>

                    {/* Sold By + Addresses */}
                    <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                        {/* Sold By */}
                        <div>
                            <p className="font-semibold mb-2">Sold By :</p>
                            <p className="font-bold">Your Company Name Pvt Ltd</p>
                            <p className="text-xs leading-relaxed mt-1">
                                Your Warehouse Address,<br />
                                Bareilly, Uttar Pradesh, 243001<br />
                                IN
                            </p>
                            <p className="mt-3 text-xs">
                                <span className="font-medium">PAN No:</span> XXXXXXXXXX<br />
                                <span className="font-medium">GST Registration No:</span> 09XXXXXXXXXXXXX
                            </p>
                        </div>

                        {/* Billing & Shipping */}
                        <div className="space-y-6">
                            {/* Billing */}
                            <div>
                                <p className="font-semibold mb-1">Billing Address :</p>
                                <p className="font-medium">{customer.name}</p>
                                <p>{customer.billing_address || customer.address}</p>
                                {customer.gstin && <p className="text-xs mt-1">GSTIN: {customer.gstin}</p>}
                            </div>

                            {/* Shipping */}
                            <div>
                                <p className="font-semibold mb-1">Shipping Address :</p>
                                <p className="font-medium">{customer.name}</p>
                                <p>{customer.shipping_address || customer.billing_address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Invoice Details */}
                    <div className="grid grid-cols-3 gap-4 border border-gray-300 p-4 mb-8 text-sm bg-gray-50">
                        <div>
                            <p><span className="font-semibold">Invoice Number :</span> {invoice_number}</p>
                            <p><span className="font-semibold">Invoice Date :</span> {date}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Order Number :</span> {orderNumber || "N/A"}</p>
                            <p><span className="font-semibold">Order Date :</span> {orderDate || date}</p>
                        </div>
                        <div>
                            <p><span className="font-semibold">Place of Supply :</span> UTTAR PRADESH</p>
                            <p><span className="font-semibold">Place of Delivery :</span> UTTAR PRADESH</p>
                        </div>
                    </div>

                    {/* Items Table - Exact Amazon Style */}
                    <table className="w-full border border-gray-400 text-sm mb-8">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-400">
                                <th className="border border-gray-400 px-3 py-3 text-left w-10">Sl. No</th>
                                <th className="border border-gray-400 px-3 py-3 text-left">Description</th>
                                <th className="border border-gray-400 px-3 py-3 text-right">Unit Price</th>
                                <th className="border border-gray-400 px-3 py-3 text-right">Discount</th>
                                <th className="border border-gray-400 px-3 py-3 text-center">Qty</th>
                                <th className="border border-gray-400 px-3 py-3 text-right">Net Amount</th>
                                <th className="border border-gray-400 px-3 py-3 text-center">Tax Rate</th>
                                <th className="border border-gray-400 px-3 py-3 text-center">Tax Type</th>
                                <th className="border border-gray-400 px-3 py-3 text-right">Tax Amount</th>
                                <th className="border border-gray-400 px-3 py-3 text-right">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {items.map((item, index) => (
                                <tr key={index} className="align-top">
                                    <td className="border border-gray-300 px-3 py-4 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 px-3 py-4 text-sm">
                                        {item.name}
                                        {item.hsn && <p className="text-xs text-gray-500 mt-1">HSN: {item.hsn}</p>}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-4 text-right">₹{item.price?.toFixed(2)}</td>
                                    <td className="border border-gray-300 px-3 py-4 text-right text-red-600">
                                        ₹{(
                                            totalItemsValue > 0
                                                ? (discountAmount * ((item.price * item.quantity) / totalItemsValue))
                                                : 0
                                        ).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-4 text-center">{item.quantity}</td>
                                    <td className="border border-gray-300 px-3 py-4 text-right font-medium">
                                        ₹{(
                                            item.price * item.quantity -
                                            (
                                                totalItemsValue > 0
                                                    ? (discountAmount * ((item.price * item.quantity) / totalItemsValue))
                                                    : 0
                                            )
                                        ).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-4 text-center">18%</td>
                                    <td className="border border-gray-300 px-3 py-4 text-center">IGST</td>
                                    <td className="border border-gray-300 px-3 py-4 text-right">
                                        ₹{(
                                            (
                                                item.price * item.quantity -
                                                (
                                                    totalItemsValue > 0
                                                        ? (discountAmount * ((item.price * item.quantity) / totalItemsValue))
                                                        : 0
                                                )
                                            ) *
                                            ((item.gst || 18) / 100)
                                        ).toFixed(2)}
                                    </td>
                                    <td className="border border-gray-300 px-3 py-4 text-right font-semibold">
                                        ₹{(() => {
                                            const itemTotal = item.price * item.quantity;

                                            const itemDiscount =
                                                totalItemsValue > 0
                                                    ? (discountAmount * (itemTotal / totalItemsValue))
                                                    : 0;

                                            const netAmount = itemTotal - itemDiscount;

                                            const gstAmount = netAmount * ((item.gst || 18) / 100);

                                            return (netAmount + gstAmount).toFixed(2);
                                        })()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-10">
                        <div className="w-96">
                            <div className="flex justify-between py-2 border-b">
                                <span>Subtotal</span>
                                <span>₹{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b text-red-600">
                                <span>
                                    Discount
                                    {discountType === "percentage" && discountValue
                                        ? ` (${discountValue}%)`
                                        : ""}
                                </span>
                                <span>- ₹{discountAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>GST</span>
                                <span>₹{totalGST.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between py-4 text-xl font-bold border-t-2 border-gray-800 mt-2">
                                <span>GRAND TOTAL</span>
                                <span>₹{grandTotal.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Amount in Words */}
                    <div className="mb-10">
                        <p className="font-semibold">
                            Amount in Words: <span className="font-normal">Rupees {Number(grandTotal).toLocaleString('en-IN', { maximumFractionDigits: 0 })} Only</span>
                        </p>
                    </div>
                    {/* Payment Method */}
                    <div className="mb-8">
                        <p className="font-semibold">
                            Payment Method: <span className="font-normal text-green-700">{paymentMethod}</span>
                        </p>
                    </div>
                    {/* Signature */}
                    <div className="border-t pt-8 mt-12 flex justify-end">
                        <div className="text-center">
                            <div className="border border-dashed border-gray-400 w-52 h-20 mb-2 flex items-center justify-center text-xs text-gray-500">
                                Authorized Signatory
                            </div>
                            <p className="text-sm font-medium">For Your Company Name Pvt Ltd</p>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-500 mt-12">
                        This is a computer generated invoice and does not require signature.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoiceFormat;