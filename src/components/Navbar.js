import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, LogIn, UserPlus, LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const adminName = localStorage.getItem("adminName") || "Admin";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center text-white">
        {/* Left - Brand */}
        <Link
          to="/dashboard"
          className="text-2xl font-bold tracking-wide hover:text-gray-200 transition"
        >
          🛍️ Admin Dashboard
        </Link>

        {/* Right - Menu */}
        <div className="flex items-center space-x-6">
          {!token ? (
            <>
              <Link
                to="/login"
                className="flex items-center space-x-1 hover:text-gray-200 transition"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </Link>

              <Link
                to="/register"
                className="flex items-center space-x-1 hover:text-gray-200 transition"
              >
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/dashboard"
                className="flex items-center space-x-1 hover:text-gray-200 transition"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md transition"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </>
          )}
        </div>
      </div>

      {token && (
        <div className="bg-blue-700 py-2 text-center text-sm text-gray-100">
          Logged in as <span className="font-semibold">{adminName}</span>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
