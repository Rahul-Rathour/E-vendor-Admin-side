import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";

import {
  MdMenuOpen,
  MdClose,
  MdKeyboardArrowDown,
  MdKeyboardArrowRight,
} from "react-icons/md";

import { IoHomeOutline } from "react-icons/io5";
import { LuBoxes, LuPackageSearch } from "react-icons/lu";
import { FaUserCircle } from "react-icons/fa";
import { CiSettings } from "react-icons/ci";

export default function SidebarMenu({ open, setOpen }) {
  const [mobileView, setMobileView] = useState(window.innerWidth <= 768);
  const [openSubmenu, setOpenSubmenu] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: <IoHomeOutline size={20} />, label: "Home", link: "/" },
    
    {
      icon: <LuBoxes size={20} />,
      label: "Products",
      hasSubmenu: true,
      submenu: [
        { label: "Add Product", link: "/add-product" },
        { label: "Manage Products", link: "/manage-product" },
      ],
    },
    
    {
      icon: <LuBoxes size={20} />,
      label: "Categories",
      hasSubmenu: true,
      submenu: [
        { label: "Add Category", link: "/add-category" },
        { label: "Manage Category", link: "/manage-category" },
      ],
    },
    
    {
      icon: <LuBoxes size={20} />,
      label: "Sub Categories",
      hasSubmenu: true,
      submenu: [
        { label: "Add Subcategory", link: "/add-subcategory" },
        { label: "Manage Subcategory", link: "/manage-subcategory" },
      ],
    },
    
    { icon: <IoHomeOutline size={20} />, label: "Manage Coupons", link: "/coupon" },
    {
      icon: <LuPackageSearch size={20} />,
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

    { icon: <CiSettings size={20} />, label: "Dashboard", link: "/dashboard" },
    { icon: <CiSettings size={20} />, label: "Contact Queries", link: "/contact" },

    {
      icon: <CiSettings size={20} />,
      label: "Settings",
      hasSubmenu: true,
      submenu: [
        { label: "Home Settings", link: "/homesettings" },
        { label: "Short videos", link: "/videos" },
        { label: "Update Banner", link: "/banner-op" },
        { label: "FAQ's", link: "/faq" },
        { label: "About Us", link: "/about" },
        { label: "Privacy Policy", link: "/privacy" },
        { label: "Button Colors", link: "/color" },
      ],
    },
  ];

  useEffect(() => {
    const updateView = () => {
      const isMobile = window.innerWidth <= 768;
      setMobileView(isMobile);

      if (isMobile) setOpen(false);
      else setOpen(true);
    };

    window.addEventListener("resize", updateView);
    return () => window.removeEventListener("resize", updateView);
  }, [setOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      {/* BACKDROP FOR MOBILE */}
      {mobileView && open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-white shadow-xl border-r z-50 
          flex flex-col transition-all duration-300 
        
          ${mobileView ? (open ? "translate-x-0" : "-translate-x-full") : ""}
          ${!mobileView ? (open ? "w-64" : "w-20") : "w-64"}
        `}
      >
        {/* FIXED HEADER */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-white sticky top-0 z-20">
          {open && <span className="text-lg font-semibold">Admin Panel</span>}

          {mobileView ? (
            <MdClose
              size={26}
              className="cursor-pointer text-gray-700"
              onClick={() => setOpen(false)}
            />
          ) : (
            <button onClick={() => setOpen(!open)}>
              <MdMenuOpen size={26} className="text-gray-700" />
            </button>
          )}
        </div>

        {/* SCROLLABLE MENU CONTENT */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.hasSubmenu ? (
                <>
                  <button
                    onClick={() =>
                      setOpenSubmenu(openSubmenu === index ? null : index)
                    }
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-gray-100 text-gray-700"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {open && <span>{item.label}</span>}
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
                          className={`block px-4 py-2 rounded-lg text-sm 
                            ${
                              location.pathname === sub.link
                                ? "bg-gray-200 font-medium"
                                : "hover:bg-gray-100"
                            }
                          `}
                          onClick={() => mobileView && setOpen(false)}
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl
                    ${
                      location.pathname === item.link
                        ? "bg-gray-200 font-medium"
                        : "hover:bg-gray-100"
                    }
                  `}
                  onClick={() => mobileView && setOpen(false)}
                >
                  {item.icon}
                  {open && <span>{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* FIXED FOOTER */}
        <div className="p-4 border-t bg-white sticky bottom-0">
          <button
            onClick={handleLogout}
            className="flex gap-3 items-center text-red-600 hover:bg-red-100 p-2 rounded-lg w-full"
          >
            <FiLogOut size={20} />
            {open && "Logout"}
          </button>

          <div className="flex items-center gap-3 mt-4">
            <FaUserCircle size={34} className="text-gray-700" />
            {open && (
              <div>
                <p className="font-medium text-sm">Rahul</p>
                <p className="text-xs text-gray-500">rahul@gmail.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}