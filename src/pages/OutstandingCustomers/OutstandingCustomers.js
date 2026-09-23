import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";
import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const OutstandingCustomers = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [customersPerPage, setCustomersPerPage] = useState(10);

  // ==============================
  // FETCH CUSTOMERS
  // ==============================
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await api.get(
          "admin/outstanding-customers"
        );

        if (response.data.status) {
          setCustomers(response.data.data || []);
          setFilteredCustomers(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching outstanding customers:", error);
        toast.error("Failed to load outstanding customers");
      }
    };

    fetchCustomers();
  }, []);

  // ==============================
  // SEARCH
  // ==============================
  useEffect(() => {
    let result = [...customers];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();

      result = result.filter((customer) => {

        return (
          String(customer.id || "").toLowerCase().includes(query) ||
          String(customer.name || "").toLowerCase().includes(query) ||
          String(customer.email || "").toLowerCase().includes(query) ||
          String(customer.phone || "").toLowerCase().includes(query)
        );

      });
    }

    setFilteredCustomers(result);
    setCurrentPage(1);

  }, [searchQuery, customers]);

  // ==============================
  // PAGINATION
  // ==============================
  const indexOfLastCustomer =
    currentPage * customersPerPage;

  const indexOfFirstCustomer =
    indexOfLastCustomer - customersPerPage;

  const currentCustomers =
    filteredCustomers.slice(
      indexOfFirstCustomer,
      indexOfLastCustomer
    );

  const totalPages =
    Math.ceil(
      filteredCustomers.length / customersPerPage
    );

  return (
    <div className="min-h-screen bg-[#f8f6f0] py-6 px-4 sm:px-6 lg:px-8">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-black rounded-2xl shadow-xl mb-6">

          <div className="px-5 sm:px-8 py-6">

            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-300 hover:text-yellow-400 mb-5 transition"
            >
              <FaArrowLeft />
              Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white">
                  Outstanding Customers
                </h1>

                <p className="text-gray-400 mt-1 text-sm">
                  Customers having outstanding credit amounts.
                </p>

              </div>

              <div className="bg-yellow-500 text-black px-5 py-3 rounded-xl font-bold">
                {filteredCustomers.length} Customers
              </div>

            </div>

          </div>

        </div>

        {/* SEARCH */}
        <div className="bg-white rounded-2xl shadow-md border p-4 mb-6">

          <div className="flex flex-col md:flex-row justify-between gap-4">

            <div className="relative w-full md:max-w-md">

              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                placeholder="Search customer, email, phone..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-yellow-500"
              />

            </div>

            <select
              value={customersPerPage}
              onChange={(e) => {
                setCustomersPerPage(
                  Number(e.target.value)
                );
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500"
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 20</option>
              <option value={50}>Show 50</option>
            </select>

          </div>

        </div>

        {/* TABLE */}
        <div className="bg-white rounded-2xl shadow-xl border overflow-hidden">

          <div className="overflow-x-auto">

            <table className="min-w-[900px] w-full">

              <thead className="bg-black">

                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                    Customer
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold text-yellow-400 uppercase">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-yellow-400 uppercase">
                    Credit Limit
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold text-yellow-400 uppercase">
                    Outstanding
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {currentCustomers.length > 0 ? (

                  currentCustomers.map((customer) => (

                    <tr
                      key={customer.id}
                      className="hover:bg-yellow-50/50 transition"
                    >

                      <td className="px-5 py-4 font-semibold">
                        #{customer.id}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {customer.name || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {customer.email || "-"}
                      </td>

                      <td className="px-5 py-4 text-gray-600">
                        {customer.phone || "-"}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        ₹
                        {Number(
                          customer.credit_limit || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-right">

                        <span className="inline-flex px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-bold">
                          ₹
                          {Number(
                            customer.outstanding || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="6"
                      className="text-center py-16 text-gray-500"
                    >
                      No outstanding customers found.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">

          <p className="text-sm text-gray-600">

            Showing{" "}
            {filteredCustomers.length === 0
              ? 0
              : indexOfFirstCustomer + 1}{" "}
            to{" "}
            {Math.min(
              indexOfLastCustomer,
              filteredCustomers.length
            )}{" "}
            of {filteredCustomers.length}

          </p>

          <div className="flex gap-2">

            <button
              disabled={currentPage === 1}
              onClick={() =>
                setCurrentPage(currentPage - 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
            >
              Previous
            </button>

            <span className="px-4 py-2 bg-black text-yellow-400 rounded-xl font-semibold">
              {currentPage} / {totalPages || 1}
            </span>

            <button
              disabled={
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() =>
                setCurrentPage(currentPage + 1)
              }
              className="px-4 py-2 border rounded-xl disabled:opacity-40 hover:bg-gray-100"
            >
              Next
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};

export default OutstandingCustomers;