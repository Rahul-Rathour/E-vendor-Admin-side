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
import { LuBoxes, LuPackageSearch, LuUsers } from "react-icons/lu";
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
      icon: <LuUsers size={20} />,
      label: "Users",
      hasSubmenu: true,
      submenu: [
        { label: "All Users", link: "/all-users" },
        // { label: "Manage Products", link: "/manage-product" },
      ],
    },
    {
      icon: <LuUsers size={20} />,
      label: "Dealers",
      hasSubmenu: true,
      submenu: [
        { label: "All Dealers", link: "/all-dealers" },
        { label: "Pending Dealers", link: "/pending-dealers" },
        { label: "Trusted Customers", link: "/trusted-dealers" },
        { label: "Outstanding Customers", link: "/outstanding-customers" },
        // { label: "Manage Products", link: "/manage-product" },
      ],
    },
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

        {
      icon: <IoHomeOutline size={20} />,
      label: "Payments",
      hasSubmenu: true,
      submenu: [
        { label: "Pending Payments", link: "/pending-credit-payments" },
        { label: "All Payments", link: "/payments" },
      ],
    },

    { icon: <IoHomeOutline size={20} />, label: "Manage Coupons", link: "/coupon" },
    // { icon: <IoHomeOutline size={20} />, label: "Payments", link: "/payments" },
    {
      icon: <LuPackageSearch size={20} />,
      label: "Orders",
      hasSubmenu: true,
      submenu: [
        { label: "All Orders", link: "/orders" },
        { label: "Wholesale Orders", link: "/bulk-orders" },
        { label: "Pending Orders", link: "/pending-orders" },
        { label: "Shipped Orders", link: "/shipped-orders" },
        { label: "Delivered Orders", link: "/delivered-orders" },
        { label: "Cancelled Orders", link: "/cancelled-orders" },
        { label: "Return Orders", link: "/return-orders" },
      ],
    },
    { icon: <CiSettings size={20} />, label: "Contact Queries", link: "/contact" },
    { icon: <CiSettings size={20} />, label: "Delivery Partner", link: "/delivery-partners" },

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
    fixed top-0 left-0 h-full
    bg-gradient-to-b from-[#0f0f0f] via-[#171717] to-[#0a0a0a]
    border-r border-yellow-500/20
    shadow-[0_0_40px_rgba(234,179,8,0.15)]
    z-50 flex flex-col
    transition-all duration-300
    text-white
    ${mobileView ? (open ? "translate-x-0" : "-translate-x-full") : ""}
    ${!mobileView ? (open ? "w-72" : "w-20") : "w-72"}
  `}
      >
        {/* FIXED HEADER */}
        <div className="
          flex items-center
          justify-between
          px-5
          py-5
          border-b
          border-yellow-500/20
          bg-black/30
          backdrop-blur-lg
          sticky
          top-0
          z-20
          "
        >
          {open && <div>
            <h2 className="text-xl font-bold text-yellow-400">
              BlackHewzen
            </h2>
            <p className="text-xs text-gray-400">
              Admin Dashboard
            </p>
          </div>
          }

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
                    className={`
                      w-full flex items-center justify-between
                      px-4 py-3 rounded-xl
                      transition-all duration-300
                      hover:bg-yellow-500/10
                      hover:text-yellow-400
                      text-gray-300
                      group
                    `}
                  >
                    <div className="flex items-center gap-3 text-inherit">
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
                          className={`block px-4 py-2 rounded-lg text-sm transition-all duration-300
${location.pathname === sub.link
                              ? "bg-yellow-500 text-black font-semibold shadow-lg"
                              : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10"
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
transition-all duration-300
${location.pathname === item.link
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold shadow-lg"
                      : "text-gray-300 hover:text-yellow-400 hover:bg-yellow-500/10"
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
        <div
          className="
  p-4
  border-t
  border-yellow-500/20
  bg-black/30
  backdrop-blur-lg
  sticky
  bottom-0
"
        >
          <button
            onClick={handleLogout}
            className="
  flex items-center
  gap-3
  w-full
  px-4
  py-3
  rounded-xl
  bg-red-500/10
  text-red-400
  hover:bg-red-500
  hover:text-white
  transition-all
  duration-300
"
          >
            <FiLogOut size={20} />
            {open && "Logout"}
          </button>

          <Link to="/profile">
            <div className="
  flex items-center
  gap-3
  mt-5
  p-3
  rounded-xl
  bg-yellow-500/10
  hover:bg-yellow-500/20
  transition-all
  duration-300
  ">
              <FaUserCircle
                size={38}
                className="text-yellow-400"
              />

              {open && (
                <div>
                  <p className="font-semibold text-white">
                    Administrator
                  </p>
                  <p className="text-xs text-gray-400">
                    Manage Account
                  </p>
                </div>
              )}
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}