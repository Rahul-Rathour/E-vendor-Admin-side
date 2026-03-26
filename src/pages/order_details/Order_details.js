import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import SidebarMenu from "../../components/SidebarMenu";
import api from "../../api";

const Order_details = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { id } = useParams();

    useEffect(() => {
        const fetchOrderItems = async () => {
            try {
                const res = await api.get(`order-items/${id}`);
                if (res.data.status) {
                    setOrderItems(res.data.data);
                }
            } catch (err) {
                console.error("Error fetching order items:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrderItems();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar */}
            {/* <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} /> */}

            {/* Main Content */}
            <div
                className={`transition-all duration-300 px-6 py-8`}
            >
                {/* Header */}
                <div className="max-w-6xl mx-auto mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">
                        Order #{id} Details
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        View products included in this order
                    </p>
                </div>

                {/* Content Card */}
                <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow border overflow-hidden">
                    {loading ? (
                        <p className="p-6 text-gray-500">Loading order items...</p>
                    ) : orderItems.length === 0 ? (
                        <p className="p-6 text-gray-500">No items found for this order.</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Product
                                        </th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">
                                            Description
                                        </th>
                                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                                            Quantity
                                        </th>
                                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">
                                            Price
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y">
                                    {orderItems.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-gray-50 transition"
                                        >
                                            {/* Product Info */}
                                            <td className="px-6 py-4 flex items-center gap-4">
                                                <img
                                                    src={`${process.env.REACT_APP_API_URL}/public/${item.product.image}`}
                                                    alt={item.product.name}
                                                    className="w-16 h-16 rounded-lg object-cover border"
                                                />
                                                <div>
                                                    <p className="font-medium text-gray-800">
                                                        {item.product.name}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Description */}
                                            <td className="px-6 py-4 text-gray-600 max-w-md">
                                                {item.product.description}
                                            </td>

                                            {/* Quantity */}
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-block px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
                                                    {item.quantity}
                                                </span>
                                            </td>

                                            {/* Price */}
                                            <td className="px-6 py-4 text-right font-semibold text-gray-800">
                                                ₹{item.price}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

};

export default Order_details;
