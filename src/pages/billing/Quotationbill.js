import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaDownload, FaFileInvoice } from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../../api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useNavigate } from "react-router-dom";

const Quotationbill = () => {
    const [products, setProducts] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [invoiceType, setInvoiceType] = useState("retail");
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [discountType, setDiscountType] = useState("amount"); // amount | percentage
    const [discountValue, setDiscountValue] = useState("");
    const navigate = useNavigate();

    const [customer, setCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        gstin: "",
        billing_address: "",
        shipping_address: "",
    });

    const [loading, setLoading] = useState(false);
    const [lastInvoiceData, setLastInvoiceData] = useState(null);

    // Fetch Products
    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await api.get("/products");
            setProducts(res.data.data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load products");
        }
    };

    const getProductPrice = (product) => {
        return invoiceType === "wholesale"
            ? parseFloat(product.wholesale_price || product.price || 0)
            : parseFloat(product.price || 0);
    };

    const addProduct = (product) => {
        const priceToUse = getProductPrice(product);
        const existing = selectedItems.find(item => item.product_id === product.id);

        if (existing) {
            setSelectedItems(selectedItems.map(item =>
                item.product_id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems([...selectedItems, {
                product_id: product.id,
                name: product.name,
                price: priceToUse,
                quantity: 1,
                gst: parseFloat(product.gst || 18)
            }]);
        }
    };

    const removeItem = (productId) => {
        setSelectedItems(selectedItems.filter(item => item.product_id !== productId));
    };

    const updateQuantity = (productId, newQty) => {
        if (newQty < 1) return;
        setSelectedItems(selectedItems.map(item =>
            item.product_id === productId ? { ...item, quantity: newQty } : item
        ));
    };

    // Update prices when invoice type changes
    useEffect(() => {
        if (selectedItems.length > 0) {
            setSelectedItems(prevItems =>
                prevItems.map(item => {
                    const product = products.find(p => p.id === item.product_id);
                    return product ? { ...item, price: getProductPrice(product) } : item;
                })
            );
        }
    }, [invoiceType, products]);

    const subtotal = selectedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity),
        0
    );

    const totalGST = selectedItems.reduce(
        (sum, item) => sum + (item.price * item.quantity * (item.gst / 100)),
        0
    );

    const discountAmount =
        discountType === "percentage"
            ? (subtotal * (parseFloat(discountValue || 0) / 100))
            : parseFloat(discountValue || 0);

    const grandTotal = subtotal + totalGST - discountAmount;

    // Create Invoice
    const handleCreateQuotation = async () => {
        if (!customer.name || !customer.phone || !customer.billing_address) {
            toast.error("Please fill all required customer details");
            return;
        }
        if (selectedItems.length === 0) {
            toast.error("Please add at least one product");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                invoice_type: invoiceType,
                payment_method: paymentMethod,
                discount: {
                    type: discountType,
                    value: parseFloat(discountValue || 0),
                    amount: discountAmount
                },
                customer: {
                    ...customer,
                    is_wholesale: invoiceType === "wholesale"
                },
                items: selectedItems.map(item => ({
                    product_id: item.product_id,
                    price: item.price,
                    quantity: item.quantity
                }))
            };

            const res = await api.post("/quotation/create", payload);

            if (res.data.status) {
                toast.success("Quotation created successfully!");

                const invoiceData = {
                    customer: { ...customer },
                    items: [...selectedItems],
                    invoiceType,
                    subtotal,
                    totalGST,
                    discountType,
                    discountValue,
                    discountAmount,
                    grandTotal,
                    invoice_number: res.data.invoice_number || `INV-${Date.now()}`,
                    paymentMethod
                };

                setLastInvoiceData(invoiceData);
                // setCreatedInvoice(res.data);
                
                // Reset form
                setSelectedItems([]);
                setCustomer({
                    name: "", email: "", phone: "", gstin: "",
                    billing_address: "", shipping_address: ""
                });
                setDiscountType("amount");
                setDiscountValue("");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create quotation");
        } finally {
            setLoading(false);
        }
    };

    // Generate PDF on Frontend
    const handleDownloadInvoice = () => {
        if (!lastInvoiceData) return;

        navigate("/invoice-format", {
            state: { invoiceData: lastInvoiceData }
        });
    };
    return (
        <div className="min-h-screen bg-orange-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
                    <h1 className="text-4xl font-bold">Create Quotation Invoice</h1>
                    <p className="text-orange-100 mt-2">Retail & Wholesale Billing System</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Products List */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                                <h2 className="text-2xl font-semibold text-gray-800">Available Products</h2>
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full md:w-80 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 outline-none"
                                />
                            </div>

                            <div className="max-h-[520px] overflow-y-auto rounded-2xl border border-gray-100">
                                <table className="w-full">
                                    <thead className="bg-orange-50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Product Name</th>
                                            <th className="px-6 py-4 text-right">
                                                Price ({invoiceType === "wholesale" ? "Wholesale" : "Retail"})
                                            </th>
                                            <th className="px-6 py-4 text-center">GST</th>
                                            <th className="px-6 py-4 text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {products
                                            .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                            .map(product => {
                                                const displayPrice = getProductPrice(product);
                                                return (
                                                    <tr key={product.id} className="hover:bg-orange-50 transition">
                                                        <td className="px-6 py-4 font-medium">{product.name}</td>
                                                        <td className="px-6 py-4 text-right font-semibold">₹{displayPrice.toFixed(2)}</td>
                                                        <td className="px-6 py-4 text-center text-sm">{product.gst || 18}%</td>
                                                        <td className="px-6 py-4 text-center">
                                                            <button
                                                                onClick={() => addProduct(product)}
                                                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-xl transition flex items-center gap-2 mx-auto"
                                                            >
                                                                <FaPlus size={16} /> Add
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Billing Form */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Invoice Type */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="font-semibold mb-4 text-gray-800">Invoice Type</h3>
                            <div className="flex gap-3">
                                <button onClick={() => setInvoiceType("retail")} className={`flex-1 py-3 rounded-2xl font-medium transition ${invoiceType === 'retail' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Retail</button>
                                <button onClick={() => setInvoiceType("wholesale")} className={`flex-1 py-3 rounded-2xl font-medium transition ${invoiceType === 'wholesale' ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Wholesale</button>
                            </div>
                        </div>

                        {/* Customer Details */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="font-semibold mb-4 text-gray-800">Customer Details</h3>
                            <div className="space-y-4">
                                <input type="text" placeholder="Customer Name *" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
                                <input type="tel" placeholder="Phone Number *" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
                                <input type="email" placeholder="Email Address" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
                                <input type="text" placeholder="GSTIN (Optional)" value={customer.gstin} onChange={(e) => setCustomer({ ...customer, gstin: e.target.value })} className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
                                <textarea placeholder="Billing Address *" value={customer.billing_address} onChange={(e) => setCustomer({ ...customer, billing_address: e.target.value })} rows="3" className="w-full border border-gray-300 rounded-2xl px-5 py-3" />
                            </div>
                        </div>
                        {/* Payment Method */}
                        {/* <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="font-semibold mb-4 text-gray-800">Payment Method</h3>
                            <select
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 outline-none"
                            >
                                <option value="Cash">Cash</option>
                                <option value="UPI">UPI</option>
                                <option value="Card">Card</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                                <option value="Credit">Credit</option>
                            </select>
                        </div> */}
                        {/* Discount */}
                        <div className="mt-4 p-4 border rounded-2xl bg-gray-50">
                            <h4 className="font-medium mb-3">Discount</h4>

                            <div className="grid grid-cols-2 gap-3">
                                <select
                                    value={discountType}
                                    onChange={(e) => setDiscountType(e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-3"
                                >
                                    <option value="amount">₹ Flat</option>
                                    <option value="percentage">Percentage (%)</option>
                                </select>

                                <input
                                    type="number"
                                    min="0"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                    placeholder={
                                        discountType === "percentage"
                                            ? "Discount %"
                                            : "Discount Amount"
                                    }
                                    className="border border-gray-300 rounded-xl px-4 py-3"
                                />
                            </div>
                        </div>
                        {/* Selected Items & Summary */}
                        <div className="bg-white rounded-3xl shadow-xl p-6">
                            <h3 className="font-semibold mb-4">Selected Products ({selectedItems.length})</h3>
                            {selectedItems.length > 0 ? (
                                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                    {selectedItems.map(item => (
                                        <div key={item.product_id} className="flex items-center justify-between bg-orange-50 p-4 rounded-2xl">
                                            <div className="flex-1">
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">₹{item.price} × {item.quantity}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex border rounded-xl">
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity - 1)} className="px-3 py-1 hover:bg-white">-</button>
                                                    <span className="px-4 py-1">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.product_id, item.quantity + 1)} className="px-3 py-1 hover:bg-white">+</button>
                                                </div>
                                                <button onClick={() => removeItem(item.product_id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center py-10">No products added yet</p>
                            )}

                            <div className="mt-6 bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-2xl">
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
                                    <div className="flex justify-between"><span>GST</span><span>₹{totalGST.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-red-600">
                                        <span>
                                            Discount
                                            {discountType === "percentage" && discountValue
                                                ? ` (${discountValue}%)`
                                                : ""}
                                        </span>
                                        <span>- ₹{discountAmount.toFixed(2)}</span>
                                    </div>
                                    <hr className="border-orange-200" />
                                    <div className="flex justify-between text-lg font-bold text-gray-800">
                                        <span>Grand Total</span>
                                        <span>₹{grandTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleCreateQuotation}
                            disabled={loading || selectedItems.length === 0 || !customer.name || !customer.phone}
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-4 rounded-3xl font-semibold text-lg flex items-center justify-center gap-3 transition"
                        >
                            {loading ? "Creating Invoice..." : "Create GST Invoice"}
                            <FaFileInvoice />
                        </button>

                        {lastInvoiceData && (
                            <button
                                onClick={handleDownloadInvoice}
                                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-4 rounded-3xl font-semibold flex items-center justify-center gap-3"
                            >
                                <FaDownload /> Print Invoice
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Quotationbill;