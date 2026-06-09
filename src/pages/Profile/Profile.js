import { useEffect, useState } from "react";
import api from "../../api";
import { toast } from "react-toastify";

const Profile = () => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit Profile Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "" });
  const [updating, setUpdating] = useState(false);

  // Change Password Modal States
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    new_password_confirmation: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchAdmin = async () => {
    try {
      const res = await api.get("admin-profile");
      if (res.data.status) {
        setAdmin(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmin();
  }, []);

  // Open Edit Profile Modal
  const openEditModal = () => {
    setEditForm({
      name: admin?.name || "",
      email: admin?.email || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle Profile Update
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const res = await api.post("admin-profile/update", editForm);
      if (res.data.status) {
        toast.success("Profile updated successfully!");
        setIsEditModalOpen(false);
        fetchAdmin();
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msg) =>
          toast.error(msg[0])
        );
      } else {
        toast.error(err.response?.data?.message || "Update failed");
      }
    } finally {
      setUpdating(false);
    }
  };

  // Open Change Password Modal
  const openPasswordModal = () => {
    setPasswordForm({ new_password: "", new_password_confirmation: "" });
    setIsPasswordModalOpen(true);
  };

  // Handle Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);

    try {
      const res = await api.post("admin-change-password", passwordForm);

      if (res.data.status) {
        toast.success("Password changed successfully!");
        setIsPasswordModalOpen(false);
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        Object.values(err.response.data.errors).forEach((msg) =>
          toast.error(msg[0])
        );
      } else {
        toast.error(err.response?.data?.message || "Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-orange-600 text-xl">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        {/* <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-3xl px-8 py-10 mb-8 shadow-xl">
          <h1 className="text-4xl font-bold">Admin Profile</h1>
          <p className="text-orange-100 mt-2">Manage your account information</p>
        </div> */}

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center gap-8 p-10 border-b">
            <div className="w-32 h-32 bg-orange-100 rounded-3xl flex items-center justify-center text-6xl border-4 border-white shadow-inner">
              👨‍💼
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-800">{admin?.name}</h2>
              <p className="text-orange-600 text-lg mt-1">{admin?.email}</p>
              <div className="mt-3 inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-2xl text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Active Admin
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Full Name</label>
                <p className="text-xl font-medium text-gray-800 bg-gray-50 px-5 py-4 rounded-2xl">
                  {admin?.name}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Email Address</label>
                <p className="text-xl font-medium text-gray-800 bg-gray-50 px-5 py-4 rounded-2xl">
                  {admin?.email}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Account Created</label>
                <p className="text-xl font-medium text-gray-800 bg-gray-50 px-5 py-4 rounded-2xl">
                  {formatDate(admin?.created_at)}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Last Updated</label>
                <p className="text-xl font-medium text-gray-800 bg-gray-50 px-5 py-4 rounded-2xl">
                  {formatDate(admin?.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t px-10 py-6 bg-gray-50 flex flex-col sm:flex-row gap-4">
            <button
              onClick={openEditModal}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-4 rounded-2xl transition-all"
            >
              Edit Profile
            </button>

            <button
              onClick={openPasswordModal}
              className="flex-1 border border-gray-300 hover:bg-gray-100 font-semibold py-4 rounded-2xl transition-all"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* ====================== EDIT PROFILE MODAL ====================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold">Edit Profile</h3>
            </div>
            <form onSubmit={handleUpdateProfile} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
                  required
                />
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-6 py-3 border rounded-2xl hover:bg-gray-100">
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 disabled:opacity-70">
                  {updating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================== CHANGE PASSWORD MODAL ====================== */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-6">
              <h3 className="text-2xl font-bold">Change Password</h3>
            </div>
            <form onSubmit={handleChangePassword} className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  className="w-full border border-gray-300 rounded-2xl px-5 py-3 focus:border-orange-500"
                  required
                  minLength={6}
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-6 py-3 border border-gray-300 rounded-2xl hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-8 py-3 bg-orange-600 text-white rounded-2xl hover:bg-orange-700 disabled:opacity-70"
                >
                  {changingPassword ? "Updating Password..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;