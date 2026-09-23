import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../api";

const All_dealers = () => {
  const [dealers, setDealers] = useState([]);
  const [filteredDealers, setFilteredDealers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(false);

  // ==========================================
  // Password Modal States
  // ==========================================

  const [showPasswordModal, setShowPasswordModal] =
    useState(false);

  const [selectedDealer, setSelectedDealer] =
    useState(null);

  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [updatingPassword, setUpdatingPassword] =
    useState(false);

  // ==========================================
  // Credit Modal States
  // ==========================================

  const [showCreditModal, setShowCreditModal] =
    useState(false);

  const [creditData, setCreditData] = useState({
    customer_name: "",
    trusted: false,
    credit_limit: 0,
    outstanding: 0,
  });

  // ==========================================
  // Open Credit Modal
  // ==========================================

  const handleOpenCreditModal = (dealer) => {
    console.log("Dealer clicked:", dealer);

    setSelectedDealer(dealer);

    setCreditData({
      customer_name: dealer.name || "",
      trusted: dealer.trusted || false,
      credit_limit: dealer.credit_limit || 0,
      outstanding: dealer.outstanding || 0,
    });

    setShowCreditModal(true);
  };

  // ==========================================
  // Fetch Dealers
  // ==========================================

  const fetchDealers = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/admin/all-dealers"
      );

      if (response.data.status) {
        setDealers(response.data.data);
        setFilteredDealers(response.data.data);
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load dealers"
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
    const filtered = dealers.filter(
      (dealer) =>
        dealer.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        dealer.email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        dealer.phone
          ?.toString()
          .includes(searchQuery) ||
        dealer.shop_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())
    );

    setFilteredDealers(filtered);
  }, [searchQuery, dealers]);

  // ==========================================
  // Open Password Modal
  // ==========================================

  const handleOpenPasswordModal = (dealer) => {
    setSelectedDealer(dealer);

    setPasswordData({
      password: "",
      password_confirmation: "",
    });

    setShowPasswordModal(true);
  };

  // ==========================================
  // Close Password Modal
  // ==========================================

  const handleClosePasswordModal = () => {
    if (updatingPassword) return;

    setShowPasswordModal(false);
    setSelectedDealer(null);

    setPasswordData({
      password: "",
      password_confirmation: "",
    });
  };

  // ==========================================
  // Password Input Change
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Update Password
  // ==========================================

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!selectedDealer?.user_id) {
      toast.error("Dealer user ID not found");
      return;
    }

    if (!passwordData.password) {
      toast.error("Please enter a password");
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (
      passwordData.password !==
      passwordData.password_confirmation
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdatingPassword(true);

      const response = await api.put(
        `/admin/dealer/${selectedDealer.user_id}/password`,
        {
          password: passwordData.password,
          password_confirmation:
            passwordData.password_confirmation,
        }
      );

      if (response.data.status) {
        toast.success(
          response.data.message ||
            "Password updated successfully"
        );

        handleClosePasswordModal();
      }
    } catch (error) {
      console.error(error);

      const validationErrors =
        error?.response?.data?.error_message;

      if (validationErrors?.password) {
        toast.error(
          validationErrors.password[0]
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
            "Failed to update password"
        );
      }
    } finally {
      setUpdatingPassword(false);
    }
  };

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
          prev.filter(
            (dealer) => dealer.user_id !== userId
          )
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
          prev.filter(
            (dealer) => dealer.user_id !== userId
          )
        );
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Dealer rejection failed"
      );
    }
  };

  // ==========================================
  // Trusted Toggle
  // ==========================================

  const handleTrustedToggle = async (userId) => {
    try {
      const response = await api.put(
        `/admin/dealer/${userId}/trusted-toggle`
      );

      if (response.data.status) {
        fetchDealers();
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update trusted status"
      );
    }
  };

  // ==========================================
  // Save Credit
  // ==========================================

  const handleSaveCredit = async () => {
    if (!selectedDealer?.user_id) {
      toast.error("Dealer user ID not found");
      return;
    }

    try {
      const response = await api.put(
        `/admin/dealer/${selectedDealer.user_id}/credit-update`,
        {
          trusted: creditData.trusted,
          credit_limit: creditData.credit_limit,
          outstanding: creditData.outstanding,
        }
      );

      if (response.data.status) {
        toast.success(
          response.data.message ||
            "Credit updated successfully"
        );

        setShowCreditModal(false);

        fetchDealers();
      }
    } catch (error) {
      console.error(error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to update credit"
      );
    }
  };

  // ==========================================
  // Close Credit Modal
  // ==========================================

  const handleCloseCreditModal = () => {
    setShowCreditModal(false);
    setSelectedDealer(null);
  };

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-[1800px] mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            sm:rounded-3xl
            mb-5
            sm:mb-7
            px-5
            py-6
            sm:px-8
            sm:py-8
            lg:px-10
            lg:py-9
            bg-gradient-to-br
            from-[#1c1c1c]
            via-[#111111]
            to-[#050505]
            border
            border-[#D4AF37]/40
            shadow-[0_15px_50px_rgba(0,0,0,0.6)]
          "
        >
          {/* Golden Glow */}

          <div
            className="
              absolute
              -right-20
              -top-20
              w-64
              h-64
              rounded-full
              bg-[#D4AF37]/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -left-20
              -bottom-24
              w-56
              h-56
              rounded-full
              bg-[#D4AF37]/5
              blur-3xl
            "
          />

          <div className="relative z-10">

            <div className="flex items-center gap-3 mb-2">

              <div
                className="
                  w-11
                  h-11
                  sm:w-12
                  sm:h-12
                  rounded-xl
                  bg-[#D4AF37]
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-[#D4AF37]/20
                "
              >
                <span className="text-black text-lg font-black">
                  D
                </span>
              </div>

              <h1
                className="
                  text-2xl
                  sm:text-3xl
                  lg:text-4xl
                  font-bold
                  text-[#D4AF37]
                  tracking-tight
                "
              >
                Dealers
              </h1>

            </div>

            <p className="text-sm sm:text-base text-gray-400">
              Manage dealer registration requests
            </p>

          </div>
        </div>

        {/* ==========================================
            MAIN TABLE CARD
        ========================================== */}

        <div
          className="
            bg-[#111111]
            rounded-2xl
            sm:rounded-3xl
            border
            border-[#D4AF37]/25
            shadow-[0_15px_50px_rgba(0,0,0,0.55)]
            overflow-hidden
          "
        >

          {/* ==========================================
              TOP BAR
          ========================================== */}

          <div
            className="
              p-4
              sm:p-5
              lg:p-6
              flex
              flex-col
              lg:flex-row
              gap-4
              lg:gap-6
              justify-between
              items-stretch
              lg:items-center
              border-b
              border-[#D4AF37]/20
              bg-black/40
            "
          >

            {/* Title */}

            <div>

              <div className="flex items-center gap-2">

                <div
                  className="
                    w-2
                    h-2
                    rounded-full
                    bg-[#D4AF37]
                    shadow-[0_0_10px_#D4AF37]
                  "
                />

                <h2
                  className="
                    text-lg
                    sm:text-xl
                    font-bold
                    text-[#D4AF37]
                  "
                >
                  Pending Dealers
                </h2>

              </div>

              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                {filteredDealers.length} dealer(s)
                waiting for verification
              </p>

            </div>

            {/* Search */}

            <div className="relative w-full lg:w-[450px]">

              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#D4AF37]
                  text-xl
                "
              >
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search name, email, phone or shop..."
                className="
                  w-full
                  bg-black/60
                  border
                  border-[#D4AF37]/30
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-sm
                  text-gray-200
                  placeholder:text-gray-600
                  focus:border-[#D4AF37]
                  focus:ring-2
                  focus:ring-[#D4AF37]/10
                  focus:outline-none
                  transition
                "
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />

            </div>

          </div>

          {/* ==========================================
              TABLE
          ========================================== */}

          <div
            className="
              w-full
              overflow-x-auto
              scrollbar-thin
              scrollbar-thumb-[#D4AF37]/50
              scrollbar-track-black/60
            "
          >

            <table className="w-full min-w-[1450px] border-collapse">

              {/* TABLE HEADER */}

              <thead>

                <tr
                  className="
                    bg-[#D4AF37]/10
                    border-b
                    border-[#D4AF37]/40
                  "
                >

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Dealer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Contact
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Shop
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Business Type
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Identity
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Password
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Credit Limit
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Outstanding
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Trusted
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#D4AF37]">
                    Action
                  </th>

                </tr>

              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-[#D4AF37]/10">

                {/* LOADING */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="11"
                      className="py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className="
                            w-10
                            h-10
                            border-4
                            border-[#D4AF37]/20
                            border-t-[#D4AF37]
                            rounded-full
                            animate-spin
                            mb-4
                          "
                        />

                        <p className="text-gray-400 text-sm">
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
                        bg-black/20
                        hover:bg-[#D4AF37]/5
                        transition-all
                        duration-200
                      "
                    >

                      {/* ID */}

                      <td className="px-5 py-5">

                        <span
                          className="
                            inline-flex
                            min-w-[42px]
                            justify-center
                            px-2
                            py-1
                            rounded-lg
                            bg-black/60
                            border
                            border-gray-800
                            text-xs
                            font-semibold
                            text-gray-400
                          "
                        >
                          #{dealer.id}
                        </span>

                      </td>

                      {/* DEALER */}

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-3">

                          <div
                            className="
                              w-10
                              h-10
                              rounded-full
                              bg-[#D4AF37]
                              flex
                              items-center
                              justify-center
                              text-black
                              font-bold
                              flex-shrink-0
                            "
                          >
                            {dealer.name
                              ?.charAt(0)
                              ?.toUpperCase() || "D"}
                          </div>

                          <div>

                            <div className="font-semibold text-gray-100 whitespace-nowrap">
                              {dealer.name || "N/A"}
                            </div>

                            <div className="text-xs text-gray-500 mt-0.5">
                              {dealer.email || "N/A"}
                            </div>

                          </div>

                        </div>

                      </td>

                      {/* CONTACT */}

                      <td className="px-5 py-5">

                        <span className="text-sm text-gray-400 whitespace-nowrap">
                          {dealer.phone || "N/A"}
                        </span>

                      </td>

                      {/* SHOP */}

                      <td className="px-5 py-5">

                        <div className="font-medium text-gray-200 whitespace-nowrap">
                          {dealer.shop_name || "N/A"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                          {dealer.city || "N/A"}
                          {dealer.city && dealer.state
                            ? ", "
                            : ""}
                          {dealer.state || ""}
                        </div>

                      </td>

                      {/* BUSINESS TYPE */}

                      <td className="px-5 py-5">

                        <span
                          className="
                            inline-flex
                            px-3
                            py-1.5
                            rounded-lg
                            bg-[#D4AF37]/10
                            border
                            border-[#D4AF37]/20
                            text-xs
                            font-medium
                            text-[#D4AF37]
                            whitespace-nowrap
                          "
                        >
                          {dealer.business_type || "N/A"}
                        </span>

                      </td>

                      {/* IDENTITY */}

                      <td className="px-5 py-5">

                        <div
                          className="
                            font-medium
                            text-gray-300
                            uppercase
                            text-sm
                          "
                        >
                          {dealer.identity_type || "N/A"}
                        </div>

                        <div className="text-xs text-gray-500 mt-1">
                          {dealer.identity_number || "N/A"}
                        </div>

                      </td>

                      {/* PASSWORD */}

                      <td className="px-5 py-5 text-center">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenPasswordModal(
                              dealer
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            px-4
                            py-2.5
                            rounded-xl
                            bg-[#D4AF37]
                            hover:bg-[#e2c45c]
                            text-black
                            text-xs
                            sm:text-sm
                            font-bold
                            shadow-md
                            shadow-[#D4AF37]/10
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            whitespace-nowrap
                          "
                        >
                          Update Password
                        </button>

                      </td>

                      {/* CREDIT LIMIT */}

                      <td className="px-5 py-5 text-right">

                        <span className="font-semibold text-gray-200 whitespace-nowrap">
                          ₹{" "}
                          {Number(
                            dealer.credit_limit || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>

                      {/* OUTSTANDING */}

                      <td className="px-5 py-5 text-right">

                        <span
                          className="
                            font-semibold
                            text-[#D4AF37]
                            whitespace-nowrap
                          "
                        >
                          ₹{" "}
                          {Number(
                            dealer.outstanding || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>

                      {/* TRUSTED */}

                      <td className="px-5 py-5 text-center">

                        <label className="relative inline-flex items-center cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              dealer.trusted === true ||
                              dealer.trusted === 1
                            }
                            className="sr-only peer"
                            onChange={() =>
                              handleTrustedToggle(
                                dealer.user_id
                              )
                            }
                          />

                          <div
                            className="
                              w-12
                              h-6
                              bg-gray-800
                              rounded-full
                              border
                              border-gray-700
                              peer
                              peer-focus:outline-none
                              peer-checked:bg-[#D4AF37]
                              peer-checked:border-[#D4AF37]
                              after:content-['']
                              after:absolute
                              after:top-[3px]
                              after:left-[3px]
                              after:bg-gray-400
                              after:rounded-full
                              after:h-4
                              after:w-4
                              after:transition-all
                              peer-checked:after:translate-x-6
                              peer-checked:after:bg-black
                            "
                          />

                        </label>

                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-5">

                        <div className="flex items-center justify-center gap-2">

                          {/* Edit Credit */}

                          <button
                            type="button"
                            onClick={() =>
                              handleOpenCreditModal(
                                dealer
                              )
                            }
                            className="
                              px-3
                              py-2
                              rounded-lg
                              border
                              border-[#D4AF37]/40
                              bg-[#D4AF37]/10
                              text-[#D4AF37]
                              text-xs
                              font-semibold
                              hover:bg-[#D4AF37]
                              hover:text-black
                              transition
                            "
                          >
                            Credit
                          </button>

                          {/* Verify */}

                          <button
                            type="button"
                            onClick={() =>
                              handleVerify(
                                dealer.user_id
                              )
                            }
                            className="
                              px-3
                              py-2
                              rounded-lg
                              bg-[#D4AF37]
                              text-black
                              text-xs
                              font-bold
                              hover:bg-[#e2c45c]
                              transition
                            "
                          >
                            Verify
                          </button>

                          {/* Reject */}

                          <button
                            type="button"
                            onClick={() =>
                              handleReject(
                                dealer.user_id
                              )
                            }
                            className="
                              px-3
                              py-2
                              rounded-lg
                              bg-black/60
                              border
                              border-red-500/30
                              text-red-400
                              text-xs
                              font-semibold
                              hover:bg-red-500/10
                              hover:border-red-500/50
                              transition
                            "
                          >
                            Reject
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  /* EMPTY STATE */

                  <tr>

                    <td
                      colSpan="11"
                      className="py-16 text-center"
                    >

                      <div className="flex flex-col items-center">

                        <div
                          className="
                            w-16
                            h-16
                            rounded-full
                            bg-[#D4AF37]/10
                            border
                            border-[#D4AF37]/20
                            flex
                            items-center
                            justify-center
                            mb-4
                          "
                        >
                          <span className="text-2xl text-[#D4AF37]">
                            ⌕
                          </span>
                        </div>

                        <p className="text-gray-300 font-semibold">
                          No dealers found
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          No dealer matches your search.
                        </p>

                      </div>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* ==========================================
              TABLE FOOTER
          ========================================== */}

          <div
            className="
              px-4
              sm:px-6
              py-4
              border-t
              border-[#D4AF37]/15
              bg-black/40
              flex
              flex-col
              sm:flex-row
              gap-3
              justify-between
              items-center
            "
          >

            <p className="text-xs sm:text-sm text-gray-500">
              Showing{" "}
              <span className="text-[#D4AF37] font-semibold">
                {filteredDealers.length}
              </span>{" "}
              dealer
              {filteredDealers.length !== 1
                ? "s"
                : ""}
            </p>

            <p className="text-xs text-gray-600">
              Scroll horizontally on smaller screens
            </p>

          </div>

        </div>
      </div>

      {/* ==================================================
          UPDATE PASSWORD MODAL
      ================================================== */}

      {showPasswordModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
            px-3
            sm:px-4
            py-4
          "
          onClick={handleClosePasswordModal}
        >

          <div
            className="
              bg-[#111111]
              w-full
              max-w-md
              max-h-[95vh]
              overflow-y-auto
              rounded-2xl
              sm:rounded-3xl
              border
              border-[#D4AF37]/40
              shadow-[0_25px_80px_rgba(0,0,0,0.8)]
              p-5
              sm:p-7
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-6
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#D4AF37]
                  "
                >
                  Update Password
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Set a new password for this dealer.
                </p>

              </div>

              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={updatingPassword}
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-black/60
                  border
                  border-gray-800
                  text-gray-500
                  hover:text-[#D4AF37]
                  hover:border-[#D4AF37]/40
                  transition
                "
              >
                ×
              </button>

            </div>

            <form onSubmit={handleUpdatePassword}>

              {/* Dealer ID */}

              <div className="mb-4">

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Dealer User ID
                </label>

                <input
                  type="text"
                  value={
                    selectedDealer?.user_id || ""
                  }
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-800
                    bg-black/60
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-gray-500
                    cursor-not-allowed
                  "
                />

              </div>

              {/* Dealer Name */}

              <div className="mb-4">

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Dealer
                </label>

                <input
                  type="text"
                  value={
                    selectedDealer?.name || ""
                  }
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-800
                    bg-black/60
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-gray-500
                    cursor-not-allowed
                  "
                />

              </div>

              {/* New Password */}

              <div className="mb-4">

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                  className="
                    w-full
                    border
                    border-[#D4AF37]/30
                    bg-black/60
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-gray-200
                    placeholder:text-gray-700
                    focus:border-[#D4AF37]
                    focus:ring-2
                    focus:ring-[#D4AF37]/10
                    focus:outline-none
                    transition
                  "
                />

              </div>

              {/* Confirm Password */}

              <div className="mb-6">

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="password_confirmation"
                  value={
                    passwordData.password_confirmation
                  }
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                  className="
                    w-full
                    border
                    border-[#D4AF37]/30
                    bg-black/60
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-gray-200
                    placeholder:text-gray-700
                    focus:border-[#D4AF37]
                    focus:ring-2
                    focus:ring-[#D4AF37]/10
                    focus:outline-none
                    transition
                  "
                />

              </div>

              {/* Buttons */}

              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  justify-end
                  gap-3
                "
              >

                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={updatingPassword}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-gray-700
                    bg-black/60
                    text-gray-400
                    text-sm
                    font-medium
                    hover:border-[#D4AF37]/40
                    hover:text-[#D4AF37]
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                    bg-[#D4AF37]
                    hover:bg-[#e2c45c]
                    text-black
                    text-sm
                    font-bold
                    shadow-lg
                    shadow-[#D4AF37]/10
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {updatingPassword
                    ? "Updating..."
                    : "Save Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* ==================================================
          CREDIT MODAL
      ================================================== */}

      {showCreditModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/60
            backdrop-blur-sm
            px-3
            sm:px-4
            py-4
          "
          onClick={handleCloseCreditModal}
        >

          <div
            className="
              bg-[#111111]
              w-full
              max-w-lg
              max-h-[95vh]
              overflow-y-auto
              rounded-2xl
              sm:rounded-3xl
              border
              border-[#D4AF37]/40
              shadow-[0_25px_80px_rgba(0,0,0,0.8)]
              p-5
              sm:p-7
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-6
              "
            >

              <div>

                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#D4AF37]
                  "
                >
                  Edit Dealer Credit
                </h2>

                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Manage trusted status and credit details.
                </p>

              </div>

              <button
                type="button"
                onClick={handleCloseCreditModal}
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-black/60
                  border
                  border-gray-800
                  text-gray-500
                  hover:text-[#D4AF37]
                  hover:border-[#D4AF37]/40
                  transition
                "
              >
                ×
              </button>

            </div>

            <div className="space-y-5">

              {/* Customer Name */}

              <div>

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Customer Name
                </label>

                <input
                  type="text"
                  value={creditData.customer_name}
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-800
                    bg-black/60
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-gray-500
                    cursor-not-allowed
                  "
                />

              </div>

              {/* Trusted */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  p-4
                  rounded-xl
                  bg-black/60
                  border
                  border-[#D4AF37]/20
                "
              >

                <div>

                  <p className="text-sm font-semibold text-gray-200">
                    Trusted Customer
                  </p>

                  <p className="text-xs text-gray-600 mt-1">
                    Enable Pay Later eligibility
                  </p>

                </div>

                <label className="relative inline-flex items-center cursor-pointer">

                  <input
                    type="checkbox"
                    checked={creditData.trusted}
                    onChange={(e) =>
                      setCreditData({
                        ...creditData,
                        trusted: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />

                  <div
                    className="
                      w-12
                      h-6
                      bg-gray-800
                      rounded-full
                      border
                      border-gray-700
                      peer
                      peer-checked:bg-[#D4AF37]
                      peer-checked:border-[#D4AF37]
                      after:content-['']
                      after:absolute
                      after:top-[3px]
                      after:left-[3px]
                      after:bg-gray-400
                      after:rounded-full
                      after:h-4
                      after:w-4
                      after:transition-all
                      peer-checked:after:translate-x-6
                      peer-checked:after:bg-black
                    "
                  />

                </label>

              </div>

              {/* Credit Limit */}

              <div>

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Credit Limit
                </label>

                <div className="relative">

                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#D4AF37]
                      font-semibold
                    "
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    value={creditData.credit_limit}
                    onChange={(e) =>
                      setCreditData({
                        ...creditData,
                        credit_limit:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      border
                      border-[#D4AF37]/30
                      bg-black/60
                      rounded-xl
                      pl-9
                      pr-4
                      py-3
                      text-sm
                      text-gray-200
                      focus:border-[#D4AF37]
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                      focus:outline-none
                    "
                  />

                </div>

              </div>

              {/* Outstanding */}

              <div>

                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-gray-400
                    mb-2
                  "
                >
                  Outstanding
                </label>

                <div className="relative">

                  <span
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#D4AF37]
                      font-semibold
                    "
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    value={creditData.outstanding}
                    onChange={(e) =>
                      setCreditData({
                        ...creditData,
                        outstanding:
                          e.target.value,
                      })
                    }
                    className="
                      w-full
                      border
                      border-[#D4AF37]/30
                      bg-black/60
                      rounded-xl
                      pl-9
                      pr-4
                      py-3
                      text-sm
                      text-gray-200
                      focus:border-[#D4AF37]
                      focus:ring-2
                      focus:ring-[#D4AF37]/10
                      focus:outline-none
                    "
                  />

                </div>

              </div>

            </div>

            {/* Credit Buttons */}

            <div
              className="
                flex
                flex-col-reverse
                sm:flex-row
                justify-end
                gap-3
                mt-7
              "
            >

              <button
                type="button"
                onClick={handleCloseCreditModal}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  border
                  border-gray-700
                  bg-black/60
                  text-gray-400
                  text-sm
                  font-medium
                  hover:border-[#D4AF37]/40
                  hover:text-[#D4AF37]
                  transition
                "
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSaveCredit}
                className="
                  w-full
                  sm:w-auto
                  px-5
                  py-3
                  rounded-xl
                  bg-[#D4AF37]
                  hover:bg-[#e2c45c]
                  text-black
                  text-sm
                  font-bold
                  shadow-lg
                  shadow-[#D4AF37]/10
                  transition
                "
              >
                Save Credit
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default All_dealers;
