import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

const PendingDealers = () => {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // ==========================================
  // Fetch Pending Dealers
  // ==========================================

  const fetchDealers = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/pending-dealers");

      if (response.data.status) {
        setDealers(response.data.data);
        setFilteredDealers(response.data.data);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message || "Failed to load dealers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  // ==========================================
  // Search
  // ==========================================

  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();

    const filtered = dealers.filter(
      (dealer) =>
        dealer.name?.toLowerCase().includes(query) ||
        dealer.email?.toLowerCase().includes(query) ||
        dealer.phone?.toString().includes(query) ||
        dealer.shop_name?.toLowerCase().includes(query)
    );

    setFilteredDealers(filtered);
  }, [searchQuery, dealers]);

  // ==========================================
  // Verify Dealer
  // ==========================================

  const handleVerify = async (userId) => {
    const confirmVerify = window.confirm(
      "Are you sure you want to verify this dealer?"
    );

    if (!confirmVerify) return;

    try {
      const response = await api.put(
        `/admin/dealer/${userId}/verify`
      );

      if (response.data.status) {
        toast.success(response.data.message);

        setDealers((prev) =>
          prev.filter((dealer) => dealer.user_id !== userId)
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Dealer verification failed"
      );
    }
  };

  // ==========================================
  // Reject Dealer
  // ==========================================

  const handleReject = async (userId) => {
    const confirmReject = window.confirm(
      "Are you sure you want to reject this dealer?"
    );

    if (!confirmReject) return;

    try {
      const response = await api.put(
        `/admin/dealer/${userId}/reject`
      );

      if (response.data.status) {
        toast.success(response.data.message);

        setDealers((prev) =>
          prev.filter((dealer) => dealer.user_id !== userId)
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Dealer rejection failed"
      );
    }
  };

  return (
    <div className="min-h-screen bg-black/60 text-white py-4 sm:py-6 lg:py-8 px-3 sm:px-4">

      <div className="max-w-7xl mx-auto">

        {/* ==========================================
            Header
        ========================================== */}

        <div
          className="
            relative
            overflow-hidden
            bg-black
            rounded-2xl
            sm:rounded-3xl
            px-5
            sm:px-8
            lg:px-10
            py-6
            sm:py-8
            lg:py-10
            mb-5
            sm:mb-8
            shadow-2xl
            border
            border-[#D4AF37]/40
          "
        >

          {/* Golden Glow */}

          <div
            className="
              absolute
              -right-24
              -top-24
              w-72
              h-72
              rounded-full
              bg-[#D4AF37]/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              right-20
              bottom-0
              w-40
              h-40
              rounded-full
              bg-[#D4AF37]/5
              blur-3xl
            "
          />

          <div className="relative z-10">

            <div className="flex items-center gap-4">

              {/* Icon */}

              <div
                className="
                  w-12
                  h-12
                  sm:w-14
                  sm:h-14
                  rounded-2xl
                  bg-[#D4AF37]
                  text-black
                  flex
                  items-center
                  justify-center
                  font-black
                  text-xl
                  shadow-lg
                  shadow-[#D4AF37]/20
                  flex-shrink-0
                "
              >
                D
              </div>

              <div>

                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    lg:text-4xl
                    font-bold
                    tracking-tight
                    text-white
                  "
                >
                  Dealer Verification
                </h1>

                <p
                  className="
                    text-gray-400
                    text-sm
                    sm:text-base
                    mt-1
                  "
                >
                  Manage dealer registration requests
                </p>

              </div>

            </div>

          </div>
        </div>

        {/* ==========================================
            Main Card
        ========================================== */}

        <div
          className="
            bg-black
            rounded-2xl
            sm:rounded-3xl
            shadow-2xl
            overflow-hidden
            border
            border-[#D4AF37]/30
          "
        >

          {/* ==========================================
              Top Bar
          ========================================== */}

          <div
            className="
              p-4
              sm:p-6
              flex
              flex-col
              lg:flex-row
              gap-4
              justify-between
              lg:items-center
              border-b
              border-[#D4AF37]/20
              bg-black
            "
          >

            {/* Title */}

            <div>

              <div className="flex items-center gap-3">

                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-white
                  "
                >
                  Pending Dealers
                </h2>

                <span
                  className="
                    inline-flex
                    items-center
                    justify-center
                    min-w-[32px]
                    h-7
                    px-2
                    rounded-full
                    bg-[#D4AF37]
                    text-black
                    text-xs
                    sm:text-sm
                    font-black
                  "
                >
                  {filteredDealers.length}
                </span>

              </div>

              <p className="text-sm text-gray-500 mt-1">
                Dealers waiting for verification
              </p>

            </div>

            {/* Search */}

            <div className="relative w-full lg:w-96">

              <div
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#D4AF37]
                  pointer-events-none
                  text-sm
                "
              >
                🔍
              </div>

              <input
                type="text"
                placeholder="Search dealer, email, phone or shop..."
                className="
                  w-full
                  bg-black/60
                  border
                  border-gray-700
                  rounded-xl
                  sm:rounded-2xl
                  pl-11
                  pr-4
                  py-3
                  text-sm
                  text-white
                  placeholder-gray-500
                  outline-none
                  transition-all
                  focus:border-[#D4AF37]
                  focus:ring-2
                  focus:ring-[#D4AF37]/20
                  hover:border-gray-600
                "
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />

            </div>

          </div>

          {/* ==========================================
              Table
          ========================================== */}

          <div
            className="
              w-full
              overflow-x-auto
              overscroll-x-contain
            "
          >

            <table
              className="
                w-full
                min-w-[1100px]
                border-collapse
              "
            >

              {/* ==========================================
                  Table Header
              ========================================== */}

              <thead
                className="
                  bg-black/60
                  border-b
                  border-[#D4AF37]/50
                "
              >

                <tr>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    ID
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Dealer
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Contact
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Shop
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Business Type
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-left
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Identity
                  </th>

                  <th
                    className="
                      px-4
                      sm:px-6
                      py-4
                      text-center
                      text-xs
                      sm:text-sm
                      font-semibold
                      text-[#D4AF37]
                      uppercase
                      tracking-wider
                      whitespace-nowrap
                    "
                  >
                    Action
                  </th>

                </tr>

              </thead>

              {/* ==========================================
                  Table Body
              ========================================== */}

              <tbody
                className="
                  divide-y
                  divide-gray-800
                "
              >

                {/* Loading */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-16"
                    >

                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          justify-center
                          gap-4
                        "
                      >

                        <div
                          className="
                            w-10
                            h-10
                            border-4
                            border-gray-700
                            border-t-[#D4AF37]
                            rounded-full
                            animate-spin
                          "
                        />

                        <p className="text-sm text-gray-500">
                          Loading dealers...
                        </p>

                      </div>

                    </td>

                  </tr>

                ) : filteredDealers.length > 0 ? (

                  filteredDealers.map((dealer) => (

                    <tr
                      key={dealer.user_id}
                      className="
                        group
                        bg-black
                        hover:bg-[#D4AF37]/5
                        transition-all
                        duration-200
                      "
                    >

                      {/* ID */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                          whitespace-nowrap
                        "
                      >

                        <span
                          className="
                            inline-flex
                            items-center
                            px-3
                            py-1.5
                            rounded-lg
                            bg-[#D4AF37]/10
                            border
                            border-[#D4AF37]/20
                            text-[#D4AF37]
                            text-xs
                            font-bold
                          "
                        >
                          #{dealer.id}
                        </span>

                      </td>

                      {/* Dealer */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            font-semibold
                            text-white
                          "
                        >
                          {dealer.name}
                        </div>

                        <div
                          className="
                            text-xs
                            sm:text-sm
                            text-gray-500
                            mt-1
                          "
                        >
                          {dealer.email}
                        </div>

                      </td>

                      {/* Contact */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                          text-gray-300
                          whitespace-nowrap
                        "
                      >
                        {dealer.phone || "N/A"}
                      </td>

                      {/* Shop */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            font-semibold
                            text-white
                          "
                        >
                          {dealer.shop_name || "N/A"}
                        </div>

                        <div
                          className="
                            text-xs
                            sm:text-sm
                            text-gray-500
                            mt-1
                          "
                        >
                          {dealer.city || "N/A"}
                          {dealer.city && dealer.state
                            ? ", "
                            : ""}
                          {dealer.state || ""}
                        </div>

                      </td>

                      {/* Business Type */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                        "
                      >

                        <span
                          className="
                            inline-flex
                            px-3
                            py-1.5
                            rounded-lg
                            bg-gray-900
                            border
                            border-gray-700
                            text-gray-300
                            text-xs
                            font-medium
                            whitespace-nowrap
                          "
                        >
                          {dealer.business_type || "N/A"}
                        </span>

                      </td>

                      {/* Identity */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            font-semibold
                            text-white
                            uppercase
                            text-sm
                          "
                        >
                          {dealer.identity_type || "N/A"}
                        </div>

                        <div
                          className="
                            text-xs
                            sm:text-sm
                            text-gray-500
                            mt-1
                          "
                        >
                          {dealer.identity_number || "N/A"}
                        </div>

                      </td>

                      {/* Action */}

                      <td
                        className="
                          px-4
                          sm:px-6
                          py-4
                          sm:py-5
                        "
                      >

                        <div
                          className="
                            flex
                            justify-center
                            items-center
                            gap-2
                          "
                        >

                          {/* Verify */}

                          <button
                            onClick={() =>
                              handleVerify(dealer.user_id)
                            }
                            className="
                              px-4
                              py-2.5
                              rounded-xl
                              bg-[#D4AF37]
                              text-black
                              font-bold
                              text-sm
                              shadow-md
                              shadow-[#D4AF37]/10
                              hover:bg-[#e1c04a]
                              hover:shadow-lg
                              hover:shadow-[#D4AF37]/20
                              transition-all
                              active:scale-95
                              whitespace-nowrap
                            "
                          >
                            Verify
                          </button>

                          {/* Reject */}

                          <button
                            onClick={() =>
                              handleReject(dealer.user_id)
                            }
                            className="
                              px-4
                              py-2.5
                              rounded-xl
                              bg-black
                              text-white
                              font-semibold
                              text-sm
                              border
                              border-gray-700
                              hover:border-[#D4AF37]
                              hover:text-[#D4AF37]
                              transition-all
                              active:scale-95
                              whitespace-nowrap
                            "
                          >
                            Reject
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  /* Empty State */

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-16"
                    >

                      <div
                        className="
                          flex
                          flex-col
                          items-center
                          justify-center
                        "
                      >

                        <div
                          className="
                            w-16
                            h-16
                            rounded-2xl
                            bg-[#D4AF37]/10
                            border
                            border-[#D4AF37]/20
                            flex
                            items-center
                            justify-center
                            text-[#D4AF37]
                            text-2xl
                            mb-4
                          "
                        >
                          ✓
                        </div>

                        <h3
                          className="
                            text-lg
                            font-semibold
                            text-white
                          "
                        >
                          No Pending Dealers
                        </h3>

                        <p
                          className="
                            text-sm
                            text-gray-500
                            mt-1
                          "
                        >
                          There are no dealer registrations
                          waiting for verification.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==========================================
              Mobile Scroll Hint
          ========================================== */}

          <div
            className="
              lg:hidden
              px-4
              py-3
              bg-black/60
              border-t
              border-[#D4AF37]/20
              text-center
              text-xs
              text-gray-500
            "
          >
            ← Swipe horizontally to view all dealer details →
          </div>

        </div>

      </div>

    </div>
  );
};

export default PendingDealers;