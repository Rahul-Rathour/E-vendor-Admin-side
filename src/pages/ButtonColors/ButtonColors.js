import React, { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

export default function ButtonColors() {
  const [primaryColor, setPrimaryColor] = useState("#4F46E5");
  const [secondaryColor, setSecondaryColor] = useState("#6B7280");
  const [loading, setLoading] = useState(false);

  // Load saved colors
  useEffect(() => {
    api
      .get("button-colors")
      .then((res) => {
        if (res.data) {
          if (res.data.primary_color) setPrimaryColor(res.data.primary_color);
          if (res.data.secondary_color) setSecondaryColor(res.data.secondary_color);
        }
      })
      .catch(() => console.log("Error loading button colors"));
  }, []);

  // Save colors
  const handleSave = async () => {
    setLoading(true);

    try {
      await api.post("button-colors", {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      toast.success("Button colors updated successfully!");
    } catch (error) {
      toast.error("Error saving colors");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Button Colors</h1>
          <p className="text-orange-100 mt-2">Customize your website button colors</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <h2 className="text-2xl font-semibold text-gray-800 mb-8">Color Settings</h2>

          {/* Primary Color */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Primary Button Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-20 h-12 cursor-pointer border-2 border-gray-200 rounded-2xl overflow-hidden"
              />
              <div>
                <p className="font-mono text-lg font-medium">{primaryColor}</p>
                <p className="text-sm text-gray-500">Used for main action buttons</p>
              </div>
            </div>
          </div>

          {/* Secondary Color */}
          <div className="mb-10">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Secondary Button Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-20 h-12 cursor-pointer border-2 border-gray-200 rounded-2xl overflow-hidden"
              />
              <div>
                <p className="font-mono text-lg font-medium">{secondaryColor}</p>
                <p className="text-sm text-gray-500">Used for secondary actions</p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="mb-10">
            <p className="text-sm font-medium text-gray-700 mb-4">Live Preview</p>
            <div className="flex flex-wrap gap-4">
              <button
                style={{ backgroundColor: primaryColor }}
                className="px-8 py-3 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition"
              >
                Primary Button
              </button>

              <button
                style={{ backgroundColor: secondaryColor }}
                className="px-8 py-3 text-white font-semibold rounded-2xl shadow-md hover:shadow-lg transition"
              >
                Secondary Button
              </button>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold text-lg rounded-2xl transition-all disabled:opacity-70"
          >
            {loading ? "Saving Changes..." : "Save Color Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}