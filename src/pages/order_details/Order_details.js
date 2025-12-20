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
        <div className="flex bg-gray-50 min-h-screen relative">
            {/* Sidebar */}
            <SidebarMenu onToggle={(isOpen) => setSidebarOpen(isOpen)} />

            {/* Dashboard Content */}
            <div
                className={`flex-1 transition-all duration-500 p-4 sm:p-6 md:p-8 ${sidebarOpen ? "ml-60" : "ml-16"
                    }`}
            >
                <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-4">
                        Order #{id} Details
                    </h2>

                    {loading ? (
                        <p className="text-gray-500">Loading order items...</p>
                    ) : orderItems.length === 0 ? (
                        <p className="text-gray-500">No items found for this order.</p>
                    ) : (
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        Product Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                                        Description
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-center text-sm font-semibold text-gray-600">
                                        Price
                                    </th>
                                </tr>
                            </thead>
                            <tbody> 
                                {orderItems.map((item) => (
                                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}/public/${item.product.image}`}
                                                alt={item.product.name}
                                                className="w-16 h-16 rounded object-cover border"
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-700">
                                            {item.product.name}
                                        </td> 
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.product.description} 
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700">
                                            {item.quantity}
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-700 font-semibold">
                                            ₹{item.price}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Order_details;
