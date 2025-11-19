import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdMenuOpen, MdOutlineDashboard, MdKeyboardArrowDown, MdKeyboardArrowRight } from "react-icons/md";
import { IoHomeOutline } from "react-icons/io5";
import { FaProductHunt, FaUserCircle } from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { IoLogoBuffer } from "react-icons/io";
import { CiSettings } from "react-icons/ci";

// Individual Menu Items
const homeItem = { icon: <IoHomeOutline size={24} />, label: "Home", link: "/" };
// const productsItem = { icon: <FaProductHunt size={24} />, label: "Products", link: "/products" };
const categoriesItem = {
  icon: <FaProductHunt size={24} />,
  label: "Categories",
  hasSubmenu: true,
  submenu: [
    { label: "Add Category", link: "/add-category" },
    { label: "Manage Category", link: "/manage-category" },
  ],
};
const productsItem = {
  icon: <FaProductHunt size={24} />,
  label: "Products",
  hasSubmenu: true,
  submenu: [
    { label: "Add Product", link: "/add-product" },
    { label: "Manage Products", link: "/manage-product" },
  ],
};
const SubCategoriesItem = {
  icon: <FaProductHunt size={24} />,
  label: "Sub categories",
  hasSubmenu: true,
  submenu: [
    { label: "Add SubCategory", link: "/add-subcategory" },
    { label: "Manage SubCategory", link: "/manage-subcategory" },
  ],
};
const OrdersItem = {
  icon: <FaProductHunt size={24} />,
  label: "Orders",
  hasSubmenu: true,
  submenu: [
    { label: "All Orders", link: "/orders" },
    { label: "Pending Orders", link: "/pending-orders" },
    { label: "Shipped Orders", link: "/shipped-orders" },
    { label: "Delivered Orders", link: "/delivered-orders" },
  ],
};
const dashboardItem = { icon: <MdOutlineDashboard size={24} />, label: "Dashboard", link: "/dashboard" };
const settingsItem = { icon: <CiSettings size={24} />, label: "Settings", link: "/settings" };
const logsItem = { icon: <IoLogoBuffer size={24} />, label: "Logs", link: "/logs" };
const reportsItem = { icon: <TbReportSearch size={24} />, label: "Reports", link: "/reports" };

// Combine Menu Items
const menuItems = [homeItem, productsItem, categoriesItem, SubCategoriesItem, OrdersItem, dashboardItem, settingsItem, logsItem, reportsItem];

export default function SidebarMenu({ onToggle }) {
  const [open, setOpen] = useState(true);
  const [openSubmenu, setOpenSubmenu] = useState(null); // track which submenu is open

  // Notify parent when sidebar toggles
  useEffect(() => {
    if (onToggle) onToggle(open);
  }, [open, onToggle]);

  const handleSubmenuToggle = (index) => {
    setOpenSubmenu(openSubmenu === index ? null : index);
  };

  return (
    <nav
      className={`fixed top-0 left-0 h-full bg-blue-600 text-white shadow-md flex flex-col transition-all duration-500 z-50 
      ${open ? "w-60" : "w-16"} `}
    >
      {/* Header */}
      <div className="px-3 py-4 flex justify-between items-center">
        <MdMenuOpen
          size={30}
          className={`cursor-pointer transition-transform duration-300 ${!open && "rotate-180"}`}
          onClick={() => setOpen(!open)}
        />
        <img src="logo.png" alt="Logo" className={`${open ? "w-10" : "w-0"} rounded-md`} />
      </div>

      {/* Menu Items */}
      <ul className="flex-1 overflow-y-auto custom-scrollbar">
        {menuItems.map((item, index) => (
          <li key={index}>
            {item.hasSubmenu ? (
              <>
                {/* Main Category Item */}
                <div
                  onClick={() => handleSubmenuToggle(index)}
                  className="px-3 py-3 my-2 hover:bg-blue-800 rounded-md duration-300 cursor-pointer flex justify-between items-center group"
                >
                  <div className="flex gap-3 items-center">
                    {item.icon}
                    <p
                      className={`whitespace-nowrap transition-all duration-300 ${
                        !open && "opacity-0 translate-x-6 w-0 overflow-hidden"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>

                  {/* Expand/Collapse Arrow */}
                  {open && (
                    <span className="ml-auto">
                      {openSubmenu === index ? (
                        <MdKeyboardArrowDown size={22} />
                      ) : (
                        <MdKeyboardArrowRight size={22} />
                      )}
                    </span>
                  )}
                </div>

                {/* Submenu Items */}
                {openSubmenu === index && open && (
                  <ul className="ml-10 mt-1">
                    {item.submenu.map((sub, subIndex) => (
                      <li key={subIndex}>
                        <Link
                          to={sub.link}
                          className="block px-2 py-2 text-sm text-blue-100 hover:text-white hover:translate-x-1 transition-all duration-200"
                        >
                          • {sub.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              // Regular menu items
              <Link
                to={item.link}
                className="px-3 py-3 my-2 hover:bg-blue-800 rounded-md duration-300 cursor-pointer flex gap-3 items-center relative group"
              >
                <div>{item.icon}</div>
                <p
                  className={`whitespace-nowrap transition-all duration-300 ${
                    !open && "opacity-0 translate-x-6 w-0 overflow-hidden"
                  }`}
                >
                  {item.label}
                </p>

                {/* Tooltip for collapsed view */}
                {!open && (
                  <span className="absolute left-16 bg-white text-black text-sm rounded-md shadow-md px-2 py-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                    {item.label}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="flex items-center gap-2 px-3 py-4 border-t border-blue-400">
        <FaUserCircle size={30} />
        <div
          className={`leading-5 transition-all duration-300 ${
            !open && "opacity-0 translate-x-6 w-0 overflow-hidden"
          }`}
        >
          <p className="font-medium">Rahul</p>
          <span className="text-xs text-blue-200">rahul@gmail.com</span>
        </div>
      </div>
    </nav>
  );
}
