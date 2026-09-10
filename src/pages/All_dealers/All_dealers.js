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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);

  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showCreditModal, setShowCreditModal] =
    useState(false);

  const [creditData, setCreditData] =
    useState({

      customer_name: "",

      trusted: false,

      credit_limit: 0,

      outstanding: 0,

    });

  const handleOpenCreditModal = (dealer) => {
    console.log("Dealer clicked:", dealer);

    setSelectedDealer(dealer);

    setCreditData({

      customer_name: dealer.name,

      trusted: dealer.trusted,

      credit_limit:
        dealer.credit_limit || 0,

      outstanding:
        dealer.outstanding || 0,

    });

    setShowCreditModal(true);

  };

  // ==========================================
  // Fetch Dealers
  // ==========================================

  const fetchDealers = async () => {

    try {

      setLoading(true);

      const response = await api.get("/admin/all-dealers");

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

    const filtered = dealers.filter((dealer) =>

      dealer.name?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||

      dealer.email?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||

      dealer.phone?.toString().includes(searchQuery) ||

      dealer.shop_name?.toLowerCase().includes(
        searchQuery.toLowerCase()
      )

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

      toast.error("Password must be at least 6 characters");

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

        toast.success(
          response.data.message
        );

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

        toast.success(
          response.data.message
        );

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

  const handleTrustedToggle = async (
    userId
  ) => {

    try {

      const response = await api.put(
        `/admin/dealer/${userId}/trusted-toggle`
      );

      if (response.data.status) {

        // toast.success(
        //   "Trusted status updated"
        // );

        fetchDealers();

      }

    } catch (error) {

      toast.error(
        error?.response?.data?.message
      );

    }

  };

  const handleSaveCredit = async () => {

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

  return (

    <div className="min-h-screen bg-orange-50 py-8 px-4">

      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="
          bg-gradient-to-r
          from-orange-500
          to-orange-600
          text-white
          rounded-3xl
          px-8
          py-10
          mb-8
          shadow-xl
        ">

          <h1 className="text-4xl font-bold">
            Dealers
          </h1>

          <p className="text-orange-100 mt-2">
            Manage dealer registration requests
          </p>

        </div>

        <div className="
          bg-white
          rounded-3xl
          shadow-xl
          overflow-hidden
        ">

          {/* Top Bar */}

          <div className="
            p-6
            flex
            flex-col
            md:flex-row
            gap-4
            justify-between
            items-center
            border-b
          ">

            <div>

              <h2 className="text-xl font-semibold">
                Pending Dealers
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {filteredDealers.length} dealer(s) waiting for verification
              </p>

            </div>

            <input
              type="text"
              placeholder="Search by name, email, phone or shop..."
              className="
                w-full
                md:w-96
                border
                border-gray-300
                rounded-2xl
                px-5
                py-3
                focus:border-orange-500
                focus:outline-none
              "
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
            />

          </div>

          {/* Table */}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1250px]">

              <thead className="bg-orange-50">

                <tr>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    ID
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Dealer
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Contact
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Shop
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Business Type
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Identity
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Update Password
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Credit Limit
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Outstanding
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Trusted
                  </th>

                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {loading ? (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-12 text-gray-500"
                    >
                      Loading dealers...
                    </td>

                  </tr>

                ) : filteredDealers.length > 0 ? (

                  filteredDealers.map((dealer) => (

                    <tr
                      key={dealer.user_id}
                      className="hover:bg-orange-50 transition-colors"
                    >

                      <td className="px-6 py-5 font-medium text-gray-700">
                        #{dealer.id}
                      </td>

                      <td className="px-6 py-5">

                        <div className="font-semibold text-gray-800">
                          {dealer.name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {dealer.email}
                        </div>

                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {dealer.phone || "N/A"}
                      </td>

                      <td className="px-6 py-5">

                        <div className="font-medium text-gray-800">
                          {dealer.shop_name}
                        </div>

                        <div className="text-sm text-gray-500">
                          {dealer.city}, {dealer.state}
                        </div>

                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {dealer.business_type || "N/A"}
                      </td>

                      <td className="px-6 py-5">

                        <div className="font-medium uppercase">
                          {dealer.identity_type}
                        </div>

                        <div className="text-sm text-gray-500">
                          {dealer.identity_number}
                        </div>

                      </td>

                      {/* Update Password */}

                      <td className="px-6 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenPasswordModal(dealer)
                          }
                          className="
                            bg-orange-500
                            hover:bg-orange-600
                            text-white
                            font-medium
                            px-4
                            py-2
                            rounded-xl
                            transition
                            duration-200
                            shadow-sm
                          "
                        >
                          Update Password
                        </button>

                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {dealer.credit_limit || "N/A"}
                      </td>

                      <td className="px-6 py-5 text-gray-600">
                        {dealer.outstanding || "N/A"}
                      </td>

                      <td className="px-6 py-5">

                        <label className="relative inline-flex cursor-pointer">

                          <input
                            type="checkbox"
                            checked={dealer.trusted}
                            className="sr-only peer"
                            onChange={() =>
                              handleTrustedToggle(
                                dealer.user_id
                              )
                            }
                          />

                          <div
                            className="
      w-11 h-6
      bg-gray-200
      peer-focus:outline-none
      rounded-full
      peer
      peer-checked:bg-green-500
      "
                          ></div>

                        </label>

                      </td>

                      <td className="px-6 py-5">

                        <button
                          onClick={() =>
                            handleOpenCreditModal(dealer)
                          }
                          className="
                            bg-blue-500
                            text-white
                            px-4
                            py-2
                            rounded-lg
                          "
                        >
                          Edit
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="text-center py-12 text-gray-500"
                    >
                      No pending dealers found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* ==========================================
          Update Password Modal
          ========================================== */}

      {showPasswordModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
          onClick={handleClosePasswordModal}
        >

          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-3xl
              shadow-2xl
              p-6
            "
            onClick={(e) => e.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-gray-800">
                Update Password
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Set a new password for this dealer.
              </p>

            </div>

            <form onSubmit={handleUpdatePassword}>

              {/* User ID */}

              <div className="mb-4">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  User ID
                </label>

                <input
                  type="text"
                  value={selectedDealer?.user_id || ""}
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-200
                    bg-gray-100
                    rounded-xl
                    px-4
                    py-3
                    text-gray-600
                    cursor-not-allowed
                  "
                />

              </div>

              {/* New Password */}

              <div className="mb-4">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
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
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-200
                    focus:outline-none
                  "
                />

              </div>

              {/* Confirm Password */}

              <div className="mb-6">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="password_confirmation"
                  value={passwordData.password_confirmation}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-200
                    focus:outline-none
                  "
                />

              </div>

              {/* Buttons */}

              <div className="
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={updatingPassword}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    text-gray-700
                    font-medium
                    hover:bg-gray-50
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >

                  {updatingPassword
                    ? "Updating..."
                    : "Save Password"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {showCreditModal && (

        <div
          className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/50
      px-4
    "
        >

          <div
            className="
        bg-white
        w-full
        max-w-lg
        rounded-3xl
        shadow-2xl
        p-6
      "
          >

            <h2 className="text-2xl font-bold mb-6">
              Edit Dealer Credit
            </h2>

            <div className="space-y-4">

              <div>
                <label className="font-medium">
                  Customer Name
                </label>

                <input
                  type="text"
                  value={creditData.customer_name}
                  readOnly
                  className="
              w-full
              border
              rounded-xl
              px-4
              py-3
              bg-gray-100
            "
                />
              </div>

              <div>
                <label className="font-medium">
                  Trusted
                </label>

                <input
                  type="checkbox"
                  checked={creditData.trusted}
                  onChange={(e) =>
                    setCreditData({
                      ...creditData,
                      trusted: e.target.checked,
                    })
                  }
                  className="ml-3"
                />
              </div>

              <div>
                <label className="font-medium">
                  Credit Limit
                </label>

                <input
                  type="number"
                  value={creditData.credit_limit}
                  onChange={(e) =>
                    setCreditData({
                      ...creditData,
                      credit_limit: e.target.value,
                    })
                  }
                  className="
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
                />
              </div>

              <div>
                <label className="font-medium">
                  Outstanding
                </label>

                <input
                  type="number"
                  value={creditData.outstanding}
                  onChange={(e) =>
                    setCreditData({
                      ...creditData,
                      outstanding: e.target.value,
                    })
                  }
                  className="
              w-full
              border
              rounded-xl
              px-4
              py-3
            "
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 mt-6">

              <button
                onClick={() =>
                  setShowCreditModal(false)
                }
                className="
            px-5
            py-2
            border
            rounded-xl
          "
              >
                Cancel
              </button>

              <button
                onClick={handleSaveCredit}
                className="
                  px-5
                  py-2
                  bg-green-500
                  text-white
                  rounded-xl
                "
              >
                Save
              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

};

export default All_dealers;
