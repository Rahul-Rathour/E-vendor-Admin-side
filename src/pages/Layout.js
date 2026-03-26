import { useState, useEffect } from "react";
import SidebarMenu from "../components/SidebarMenu";
import { MdMenuOpen } from "react-icons/md";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (mobile) setSidebarOpen(false);
      else setSidebarOpen(true);
    };

    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  return (
    <div className="flex w-full overflow-x-hidden">

      {/* MOBILE HAMBURGER */}
      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-md border"
        >
          <MdMenuOpen size={28} />
        </button>
      )}

      <SidebarMenu open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* PAGE CONTENT */}
      <main
        className={`transition-all duration-300 w-full p-6 
          ${isMobile ? "" : sidebarOpen ? "ml-64" : "ml-20"}
        `}
      >
        {children}
      </main>
    </div>
  );
}