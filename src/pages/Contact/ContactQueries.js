import React, { useEffect, useState } from "react";
import api from "../../api"; // adjust path based on your structure

const ContactQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/contact")
      .then((res) => {
        if (res.data?.status) {
          setQueries(res.data.data);
        }
      })
      .catch((err) => {
        console.error("Error fetching contact queries:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">User Contact Queries</h2>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : queries.length === 0 ? (
        <p className="text-gray-500">No queries found.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-xl">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3 border">ID</th>
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Message</th>
                <th className="p-3 border">Date</th>
              </tr>
            </thead>

            <tbody>
              {queries.map((query) => (
                <tr key={query.id} className="hover:bg-gray-50 transition">
                  <td className="p-3 border">{query.id}</td>
                  <td className="p-3 border">{query.name}</td>
                  <td className="p-3 border text-blue-600">{query.email}</td>
                  <td className="p-3 border">{query.message}</td>
                  <td className="p-3 border">
                    {new Date(query.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}
    </div>
  );
};

export default ContactQueries;