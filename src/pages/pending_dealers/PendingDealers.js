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

        // Remove from pending table
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

        // Remove from pending table
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
            Dealer Verification
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

            <table className="w-full min-w-[1100px]">

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

                  <th className="px-6 py-5 text-center text-sm font-semibold text-gray-700">
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

                      <td className="px-6 py-5">

                        <div className="flex justify-center gap-2">

                          <button
                            onClick={() =>
                              handleVerify(dealer.user_id)
                            }
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-green-600
                              text-white
                              font-medium
                              hover:bg-green-700
                              transition
                            "
                          >
                            Verify
                          </button>

                          <button
                            onClick={() =>
                              handleReject(dealer.user_id)
                            }
                            className="
                              px-4
                              py-2
                              rounded-xl
                              bg-red-600
                              text-white
                              font-medium
                              hover:bg-red-700
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

    </div>
  );
};

export default PendingDealers;