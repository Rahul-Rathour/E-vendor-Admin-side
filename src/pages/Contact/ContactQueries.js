import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const ContactQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await api.get("/contact");
        if (res.data?.status) {
          setQueries(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching contact queries:", err);
        toast.error("Failed to load queries");
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  // Search Filter
  const filteredQueries = queries.filter((query) =>
    query.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    query.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    query.message?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Contact Queries</h1>
          <p className="text-orange-100 mt-2">View all user inquiries and messages</p>
        </div> */}

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-96 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
          />
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-600">Loading queries...</div>
          ) : filteredQueries.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No contact queries found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-orange-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Name</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Email</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Message</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredQueries.map((query) => (
                    <tr key={query.id} className="hover:bg-orange-50 transition">
                      <td className="px-6 py-5 font-medium text-gray-800">#{query.id}</td>
                      <td className="px-6 py-5 font-medium">{query.name}</td>
                      <td className="px-6 py-5 text-blue-600">{query.email}</td>
                      <td className="px-6 py-5 max-w-md truncate">{query.message}</td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(query.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Total Queries: {filteredQueries.length}
        </p>
      </div>
    </div>
  );
};

export default ContactQueries;