import { useState, useEffect } from "react";
import SidebarMenu from "../components/SidebarMenu";
import { MdMenuOpen } from "react-icons/md";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(
    window.innerWidth > 768
  );

  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= 768
  );

  useEffect(() => {
    const updateSize = () => {
      const mobile = window.innerWidth <= 768;

      setIsMobile(mobile);

      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", updateSize);

    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div className="flex w-full min-h-screen overflow-x-hidden bg-[#0f0d09]">

      {/* ==========================================
          MOBILE HAMBURGER
      ========================================== */}

      {isMobile && !sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="
            fixed
            top-4
            left-4
            z-50
            w-11
            h-11
            flex
            items-center
            justify-center
            bg-[#17130d]
            text-[#d4af37]
            rounded-xl
            shadow-lg
            border
            border-[#806319]
            hover:bg-[#241c0d]
            transition
          "
        >
          <MdMenuOpen size={27} />
        </button>
      )}

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <SidebarMenu
        open={sidebarOpen}
        setOpen={setSidebarOpen}
      />

      {/* ==========================================
          PAGE CONTENT
      ========================================== */}

      <main
        className={`
          min-h-screen
          min-w-0
          flex-1
          w-0
          transition-all
          duration-300
          overflow-y-auto
          overflow-x-hidden
          bg-[#0f0d09]

          ${
            isMobile
              ? "pt-16 px-3 sm:px-4 pb-6"
              : sidebarOpen
              ? "ml-64 px-4 sm:px-5 lg:px-6 py-6"
              : "ml-20 px-4 sm:px-5 lg:px-6 py-6"
          }
        `}
      >
        {/* Content wrapper */}

        <div className="w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}