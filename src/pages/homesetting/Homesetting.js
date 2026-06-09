import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const Homesetting = () => {
  const [form, setForm] = useState({
    mobile: "",
    email: "",
    address: "",
    website: "",
  });

  const [logo, setLogo] = useState(null);
  const [favicon, setFavicon] = useState(null);

  const [previewLogo, setPreviewLogo] = useState(null);
  const [previewFavicon, setPreviewFavicon] = useState(null);

  const [loading, setLoading] = useState(false);

  // Load existing settings
  useEffect(() => {
    api.get("/home-setting")
      .then((res) => {
        setForm({
          mobile: res.data.mobile || "",
          email: res.data.email || "",
          address: res.data.address || "",
          website: res.data.website || "",
        });

        if (res.data.logo) setPreviewLogo(res.data.logo);
        if (res.data.favicon) setPreviewFavicon(res.data.favicon);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      setPreviewLogo(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFavicon(file);
      setPreviewFavicon(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append("mobile", form.mobile);
    data.append("email", form.email);
    data.append("address", form.address);
    data.append("website", form.website);

    if (logo) data.append("logo", logo);
    if (favicon) data.append("favicon", favicon);

    try {
      await api.post("/home-setting", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Home settings updated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Home Settings</h1>
          <p className="text-orange-100 mt-2">Manage your website contact details and branding</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                  <input
                    type="text"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                    placeholder="info@yourwebsite.com"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                    placeholder="123, Street Name, City, State"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
                  <input
                    type="text"
                    name="website"
                    value={form.website}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500 focus:outline-none"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Branding Section */}
            <div>
              <h3 className="text-xl font-semibold mb-5 text-gray-800">Branding</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Website Logo</label>
                  <div className="border-2 border-dashed border-orange-200 rounded-3xl p-6 text-center hover:border-orange-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <div className="text-orange-500 text-4xl mb-2">📸</div>
                      <p className="text-sm font-medium">Click to upload Logo</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG (Recommended 300x100)</p>
                    </label>
                  </div>
                  {previewLogo && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={previewLogo}
                        alt="Logo Preview"
                        className="h-20 object-contain border rounded-2xl p-2 bg-white shadow"
                      />
                    </div>
                  )}
                </div>

                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Favicon</label>
                  <div className="border-2 border-dashed border-orange-200 rounded-3xl p-6 text-center hover:border-orange-400 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFaviconChange}
                      className="hidden"
                      id="favicon-upload"
                    />
                    <label htmlFor="favicon-upload" className="cursor-pointer">
                      <div className="text-orange-500 text-4xl mb-2">🌐</div>
                      <p className="text-sm font-medium">Click to upload Favicon</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, ICO (Recommended 32x32)</p>
                    </label>
                  </div>
                  {previewFavicon && (
                    <div className="mt-4 flex justify-center">
                      <img
                        src={previewFavicon}
                        alt="Favicon Preview"
                        className="h-16 w-16 object-contain border rounded-2xl p-2 bg-white shadow"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg rounded-2xl transition-all disabled:opacity-70"
              >
                {loading ? "Updating Settings..." : "Update Home Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Homesetting;