import React, { useState, useEffect } from 'react';
import api from '../../api';
import { toast } from "react-toastify";

const DeliveryPartners = () => {
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [partnersPerPage, setPartnersPerPage] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  
  // Simplified formData - only name
  const [formData, setFormData] = useState({
    name: '',
    link:'',
  });

  // Fetch all delivery partners
  const fetchPartners = async () => {
    try {
      const res = await api.get('/delivery-partners');
      if (res.data.status) {
        setPartners(res.data.data || []);
        setFilteredPartners(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load delivery partners");
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Search & Filter
  useEffect(() => {
    let result = [...partners];

    if (searchQuery) {
      result = result.filter((partner) =>
        partner.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.city?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter((partner) => partner.status === statusFilter);
    }

    setFilteredPartners(result);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, partners]);

  // Pagination
  const indexOfLast = currentPage * partnersPerPage;
  const indexOfFirst = indexOfLast - partnersPerPage;
  const currentPartners = filteredPartners.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredPartners.length / partnersPerPage);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  // Open Add Modal
  const openAddModal = () => {
    setEditingPartner(null);
    setFormData({ name: '' });
    setFormData({ link: '' });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      link: partner.link || '',
    });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      if (editingPartner) {
        await api.put(`/delivery-partners/update/${editingPartner.id}`, formData);
        toast.success('Delivery Partner updated successfully');
      } else {
        await api.post('/delivery-partners/add', formData);
        toast.success('Delivery Partner added successfully');
      }

      setModalOpen(false);
      fetchPartners();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Something went wrong');
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this delivery partner?')) return;

    try {
      await api.delete(`/delivery-partners/delete/${id}`);
      toast.success('Delivery Partner deleted successfully');
      fetchPartners();
    } catch (err) {
      toast.error('Failed to delete delivery partner');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Delivery Partners</h1>
          <p className="text-orange-100 mt-2">Manage your delivery team and logistics partners</p>
        </div>

        {/* Filters & Add Button */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-3 flex-wrap">
            <select
              value={partnersPerPage}
              onChange={(e) => {
                setPartnersPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value={5}>Show 5</option>
              <option value={10}>Show 10</option>
              <option value={20}>Show 20</option>
              <option value={50}>Show 50</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-2xl px-4 py-3 focus:border-orange-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="busy">Busy</option>
            </select>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Search by name, email or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-96 border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
            />

            <button
              onClick={openAddModal}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2 transition shadow-sm"
            >
              + Add Partner
            </button>
          </div>
        </div>

        {/* Table - kept as is (you can remove columns later if needed) */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-orange-50">
                <tr>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">ID</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-5 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-8 py-5 text-center text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {currentPartners.length > 0 ? (
                  currentPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-orange-50 transition">
                      <td className="px-6 py-5 font-medium">{partner.id}</td>
                      <td className="px-6 py-5 font-medium text-gray-800">{partner.name}</td>
                         <td className="px-6 py-5">
                        <span
                          className={`px-4 py-1.5 text-xs font-medium rounded-2xl ${
                            partner.status === "active"
                              ? "bg-green-100 text-green-700"
                              : partner.status === "busy"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {partner.status}
                        </span>
                      </td>
            
                      <td className="px-8 py-5 text-center space-x-4">
                        <button
                          onClick={() => openEditModal(partner)}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(partner.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-gray-500">
                      No delivery partners found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-8 px-2">
          <span className="text-sm text-gray-600">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredPartners.length)} of {filteredPartners.length} partners
          </span>

          <div className="flex gap-3">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>
            <span className="px-6 py-3 bg-orange-100 text-orange-700 font-medium rounded-2xl">
              Page {currentPage} of {totalPages || 1}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              className="px-6 py-3 border border-gray-300 rounded-2xl disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal - Only Name Field */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md mx-4 shadow-2xl">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-800">
                {editingPartner ? 'Edit Delivery Partner' : 'Add New Delivery Partner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder="Enter partner name"
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  placeholder="Enter partner link"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-orange-600 text-white rounded-2xl font-medium hover:bg-orange-700 transition"
                >
                  {editingPartner ? 'Update Partner' : 'Add Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPartners;