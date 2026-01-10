import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  MdMenuOpen,
  MdOutlineDashboard,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt, FaUserCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";

const menuItems = [
  { icon: <IoHomeOutline size={20} />, label: "Home", link: "/" },
  {
    icon: <FaProductHunt size={20} />,
    label: "Products",
    hasSubmenu: true,
    submenu: [
      { label: "Add Product", link: "/add-product" },
      { label: "Manage Products", link: "/manage-product" },
    ],
  },
  {
    icon: <FaProductHunt size={20} />,
    label: "Categories",
    hasSubmenu: true,
    submenu: [
      { label: "Add Category", link: "/add-category" },
      { label: "Manage Category", link: "/manage-category" },
    ],
  },
  {
    icon: <FaProductHunt size={20} />,
    label: "Sub Categories",
    hasSubmenu: true,
    submenu: [
      { label: "Add Subcategory", link: "/add-subcategory" },
      { label: "Manage Subcategory", link: "/manage-subcategory" },
    ],
  },
  {
    icon: <FaProductHunt size={20} />,
    label: "Orders",
    hasSubmenu: true,
    submenu: [
      { label: "All Orders", link: "/orders" },
      { label: "Pending Orders", link: "/pending-orders" },
      { label: "Shipped Orders", link: "/shipped-orders" },
      { label: "Delivered Orders", link: "/delivered-orders" },
      { label: "Cancelled Orders", link: "/cancelled-orders" },
    ],
  },
  { icon: <MdOutlineDashboard size={20} />, label: "Dashboard", link: "/dashboard" },
  { icon: <CiSettings size={20} />, label: "Settings", link: "/settings" },
];

export default function SidebarMenu({ onToggle }) {
  const [open, setOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    onToggle?.(open);
  }, [open, onToggle]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside
      className={`fixed top-0 left-0 h-full 
      bg-gradient-to-b from-[#3b1d6b] via-[#4c1f7c] to-[#8a0f32]
      bg-cover bg-center bg-no-repeat
      text-white shadow-xl transition-all duration-300 z-50
      ${open ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        <span className={`font-semibold text-lg text-white ${!open && "hidden"}`}>
          Admin Panel
        </span>
        <MdMenuOpen
          size={26}
          className={`cursor-pointer text-white transition-transform ${
            !open && "rotate-180"
          }`}
          onClick={() => setOpen(!open)}
        />
      </div>

      {/* Menu */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item, index) => (
          <div key={index}>
            {item.hasSubmenu ? (
              <>
                <button
                  onClick={() =>
                    setOpenSubmenu(openSubmenu === index ? null : index)
                  }
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg
                    text-gray-200 hover:bg-white/10 transition-all duration-200"
                >
                  <div className="flex items-center gap-4 group">
                    <span className="text-gray-200 group-hover:text-white transition">
                      {item.icon}
                    </span>
                    {open && <span className="text-sm font-medium">{item.label}</span>}
                  </div>

                  {open &&
                    (openSubmenu === index ? (
                      <MdKeyboardArrowDown />
                    ) : (
                      <MdKeyboardArrowRight />
                    ))}
                </button>

                {openSubmenu === index && open && (
                  <div className="ml-10 mt-1 space-y-1">
                    {item.submenu.map((sub, i) => (
                      <Link
                        key={i}
                        to={sub.link}
                        className={`block text-sm px-4 py-2 rounded-lg transition-all duration-200
                          ${
                            isActive(sub.link)
                              ? "bg-white/20 text-white font-medium"
                              : "text-gray-300 hover:bg-white/10"
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={item.link}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200
                  ${
                    isActive(item.link)
                      ? "bg-white/20 text-white font-medium shadow-sm"
                      : "text-gray-200 hover:bg-white/10"
                  }`}
              >
                <span className="text-gray-200 group-hover:text-white transition">
                  {item.icon}
                </span>
                {open && <span className="text-sm">{item.label}</span>}
              </Link>
            )}
          </div>
        ))}

        <FiLogOut
          size={24}
          onClick={handleLogout}
          className="cursor-pointer text-gray-300 hover:text-red-400 transition mt-4 ml-2"
          title="Logout"
        />
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 w-full border-t border-white/10 p-4 flex items-center gap-3 bg-white/5">
        <FaUserCircle size={34} className="text-gray-200" />
        {open && (
          <div>
            <p className="text-sm font-medium text-white">Rahul</p>
            <p className="text-xs text-gray-300">rahul@gmail.com</p>
          </div>
        )}
      </div>
    </aside>
  );
}
