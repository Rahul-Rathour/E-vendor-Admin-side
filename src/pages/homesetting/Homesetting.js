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

  // Load existing settings
  useEffect(() => {
    api.get("/home-setting").then((res) => {
      setForm({
        mobile: res.data.mobile || "",
        email: res.data.email || "",
        address: res.data.address || "",
        website: res.data.website || "",
      });

      if (res.data.logo) setPreviewLogo(res.data.logo);
      if (res.data.favicon) setPreviewFavicon(res.data.favicon);
    });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Home Settings</h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* MOBILE */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Mobile</label>
            <input
              type="text"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter mobile number"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter address"
            />
          </div>

          {/* WEBSITE */}
          <div>
            <label className="block mb-1 text-gray-700 font-medium">Website URL</label>
            <input
              type="text"
              name="website"
              value={form.website}
              onChange={handleChange}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
          </div>
        </div>

        {/* Logo Upload */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Logo</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => {
                setLogo(e.target.files[0]);
                setPreviewLogo(URL.createObjectURL(e.target.files[0]));
              }}
              className="p-2 border rounded-lg"
            />

            {previewLogo && (
              <img
                src={previewLogo}
                alt="Logo Preview"
                className="w-16 h-16 rounded border object-contain"
              />
            )}
          </div>
        </div>

        {/* Favicon Upload */}
        <div>
          <label className="block mb-1 text-gray-700 font-medium">Favicon</label>
          <div className="flex items-center gap-4">
            <input
              type="file"
              onChange={(e) => {
                setFavicon(e.target.files[0]);
                setPreviewFavicon(URL.createObjectURL(e.target.files[0]));
              }}
              className="p-2 border rounded-lg"
            />

            {previewFavicon && (
              <img
                src={previewFavicon}
                alt="Favicon Preview"
                className="w-10 h-10 rounded border object-contain"
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 transition"
        >
          Update Settings
        </button>
      </form>
    </div>
  );
};

export default Homesetting;