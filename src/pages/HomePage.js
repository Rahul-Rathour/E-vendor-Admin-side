import { Link } from "react-router-dom";
import {
  Package,
  Layers,
  Grid,
  PlusCircle,
  LogOut,
} from "lucide-react";

function HomePage() {
  const admin = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-10">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-2xl p-8 border border-blue-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            Welcome, {admin}! 👋
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Dashboard Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/add-category"
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <PlusCircle className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Add Category</h3>
          </Link>

          <Link
            to="/manage-category"
            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <Grid className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Manage Categories</h3>
          </Link>

          <Link
            to="/add-subcategory"
            className="bg-green-500 hover:bg-green-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <PlusCircle className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Add Subcategory</h3>
          </Link>

          <Link
            to="/manage-subcategory"
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <Layers className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Manage Subcategories</h3>
          </Link>

          <Link
            to="/add-product"
            className="bg-purple-500 hover:bg-purple-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <PlusCircle className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Add Product</h3>
          </Link>

          <Link
            to="/manage-product"
            className="bg-pink-500 hover:bg-pink-600 text-white rounded-2xl shadow-lg p-6 flex flex-col items-center transition"
          >
            <Package className="w-10 h-10 mb-3" />
            <h3 className="font-semibold text-lg">Manage Products</h3>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
