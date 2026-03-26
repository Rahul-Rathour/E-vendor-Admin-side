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
      const res = await api.post("button-colors", {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      toast.success("Button colors updated successfully!");
    } catch (error) {
      toast.alert("Error saving colors");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-md rounded-xl mt-6">
      <h2 className="text-2xl font-semibold mb-4">Button Color Settings</h2>

      {/* Primary Color Picker */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Primary Button Color</label>
        <input
          type="color"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="w-16 h-10 cursor-pointer border rounded"
        />
        <p className="mt-2 text-gray-600">Selected: {primaryColor}</p>
      </div>

      {/* Secondary Color Picker */}
      <div className="mb-6">
        <label className="text-sm font-medium mb-2 block">Secondary Button Color</label>
        <input
          type="color"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          className="w-16 h-10 cursor-pointer border rounded"
        />
        <p className="mt-2 text-gray-600">Selected: {secondaryColor}</p>
      </div>

      {/* Preview Buttons */}
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Preview:</p>

        <button
          style={{ background: primaryColor }}
          className="px-4 py-2 text-white rounded-lg shadow-sm mr-3"
        >
          Primary Button
        </button>

        <button
          style={{ background: secondaryColor }}
          className="px-4 py-2 text-white rounded-lg shadow-sm"
        >
          Secondary Button
        </button>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Colors"}
      </button>
    </div>
  );
}