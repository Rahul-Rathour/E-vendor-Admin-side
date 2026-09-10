import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../../api";

const All_users = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(10);

  // ==========================================
  // Password Modal States
  // ==========================================

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [passwordData, setPasswordData] = useState({
    password: "",
    password_confirmation: "",
  });

  const [updatingPassword, setUpdatingPassword] = useState(false);

  // ==========================================
  // Fetch Users
  // ==========================================

  const fetchUsers = async () => {
    try {
      const response = await api.get("get-users");

      if (response.data.status) {
        setUsers(response.data.data);
        setFilteredUsers(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);

      toast.error(
        error?.response?.data?.message ||
        "Failed to load users"
      );
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ==========================================
  // Search Filter
  // ==========================================

  useEffect(() => {
    const filtered = users.filter((user) =>
      user.name?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      user.email?.toLowerCase().includes(
        searchQuery.toLowerCase()
      ) ||
      user.phone?.toString().includes(searchQuery)
    );

    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchQuery, users]);

  // ==========================================
  // Pagination
  // ==========================================

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;

  const currentUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(
    filteredUsers.length / usersPerPage
  );

  // ==========================================
  // Open Password Modal
  // ==========================================

  const handleOpenPasswordModal = (user) => {
    setSelectedUser(user);

    setPasswordData({
      password: "",
      password_confirmation: "",
    });

    setShowPasswordModal(true);
  };

  // ==========================================
  // Close Password Modal
  // ==========================================

  const handleClosePasswordModal = () => {
    if (updatingPassword) return;

    setShowPasswordModal(false);
    setSelectedUser(null);

    setPasswordData({
      password: "",
      password_confirmation: "",
    });
  };

  // ==========================================
  // Password Input Change
  // ==========================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ==========================================
  // Update Password
  // ==========================================

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (!selectedUser?.user_id) {
      toast.error("User ID not found");
      return;
    }

    if (!passwordData.password) {
      toast.error("Please enter a password");
      return;
    }

    if (passwordData.password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return;
    }

    if (
      passwordData.password !==
      passwordData.password_confirmation
    ) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setUpdatingPassword(true);

      const response = await api.put(
        `/admin/user/${selectedUser.user_id}/password`,
        {
          password: passwordData.password,
          password_confirmation:
            passwordData.password_confirmation,
        }
      );

      if (response.data.status) {
        toast.success(
          response.data.message ||
          "Password updated successfully"
        );

        handleClosePasswordModal();
      }
    } catch (error) {
      console.error(
        "Password update error:",
        error
      );

      const validationErrors =
        error?.response?.data?.error_message;

      if (validationErrors?.password) {
        toast.error(
          validationErrors.password[0]
        );
      } else {
        toast.error(
          error?.response?.data?.message ||
          "Failed to update password"
        );
      }
    } finally {
      setUpdatingPassword(false);
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
            All Users
          </h1>

          <p className="text-orange-100 mt-2">
            Manage and view all registered users
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

            <div className="flex items-center gap-4 w-full md:w-auto">

              <label className="
                text-sm
                text-gray-600
                whitespace-nowrap
              ">
                Show
              </label>

              <select
                value={usersPerPage}
                onChange={(e) => {
                  setUsersPerPage(
                    Number(e.target.value)
                  );

                  setCurrentPage(1);
                }}
                className="
                  border
                  border-gray-300
                  rounded-2xl
                  px-4
                  py-3
                  focus:border-orange-500
                  focus:outline-none
                "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

            </div>

            <input
              type="text"
              placeholder="Search by name, email or phone..."
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

            <table className="w-full min-w-[950px]">

              <thead className="bg-orange-50">

                <tr>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    ID
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    User ID
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    Name
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    Email
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    Phone
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    Joined On
                  </th>

                  <th className="
                    px-6
                    py-5
                    text-left
                    text-sm
                    font-semibold
                    text-gray-700
                  ">
                    Update Password
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {currentUsers.length > 0 ? (

                  currentUsers.map((user) => (

                    <tr
                      key={user.id}
                      className="
                        hover:bg-orange-50
                        transition-colors
                      "
                    >

                      <td className="
                        px-6
                        py-5
                        font-medium
                        text-gray-700
                      ">
                        #{user.id}
                      </td>

                      <td className="
                        px-6
                        py-5
                        font-medium
                        text-orange-600
                      ">
                        {user.user_id || "N/A"}
                      </td>

                      <td className="
                        px-6
                        py-5
                        font-medium
                        text-gray-800
                      ">
                        {user.name}
                      </td>

                      <td className="
                        px-6
                        py-5
                        text-gray-600
                      ">
                        {user.email}
                      </td>

                      <td className="
                        px-6
                        py-5
                        text-gray-600
                      ">
                        {user.phone || "N/A"}
                      </td>

                      <td className="
                        px-6
                        py-5
                        text-gray-500
                        text-sm
                      ">
                        {new Date(
                          user.created_at
                        ).toLocaleDateString("en-IN")}
                      </td>

                      {/* Update Password Button */}

                      <td className="px-6 py-5">

                        <button
                          type="button"
                          onClick={() =>
                            handleOpenPasswordModal(user)
                          }
                          className="
                            bg-orange-500
                            hover:bg-orange-600
                            text-white
                            font-medium
                            px-4
                            py-2
                            rounded-xl
                            transition
                            duration-200
                            shadow-sm
                          "
                        >
                          Update Password
                        </button>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>

                    <td
                      colSpan="7"
                      className="
                        text-center
                        py-12
                        text-gray-500
                      "
                    >
                      No users found
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

          {/* Pagination */}

          <div className="
            px-6
            py-5
            flex
            flex-col
            sm:flex-row
            justify-between
            items-center
            border-t
            bg-gray-50
          ">

            <span className="
              text-sm
              text-gray-600
              mb-3
              sm:mb-0
            ">
              Showing{" "}
              {filteredUsers.length === 0
                ? 0
                : indexOfFirstUser + 1}{" "}
              to{" "}
              {Math.min(
                indexOfLastUser,
                filteredUsers.length
              )}{" "}
              of {filteredUsers.length} users
            </span>

            <div className="flex gap-2 flex-wrap">

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className="
                  px-5
                  py-2
                  border
                  border-gray-300
                  rounded-2xl
                  disabled:opacity-50
                  hover:bg-gray-100
                  transition
                "
              >
                Previous
              </button>

              {Array.from(
                { length: totalPages },
                (_, i) => i + 1
              ).map((page) => (

                <button
                  key={page}
                  onClick={() =>
                    setCurrentPage(page)
                  }
                  className={`
                    px-4
                    py-2
                    rounded-2xl
                    transition
                    ${
                      currentPage === page
                        ? "bg-orange-600 text-white"
                        : "border border-gray-300 hover:bg-gray-100"
                    }
                  `}
                >
                  {page}
                </button>

              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  currentPage === totalPages ||
                  totalPages === 0
                }
                className="
                  px-5
                  py-2
                  border
                  border-gray-300
                  rounded-2xl
                  disabled:opacity-50
                  hover:bg-gray-100
                  transition
                "
              >
                Next
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* ==========================================
          UPDATE PASSWORD MODAL
          ========================================== */}

      {showPasswordModal && (

        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/50
            px-4
          "
          onClick={handleClosePasswordModal}
        >

          <div
            className="
              bg-white
              w-full
              max-w-md
              rounded-3xl
              shadow-2xl
              p-6
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div className="mb-6">

              <h2 className="
                text-2xl
                font-bold
                text-gray-800
              ">
                Update Password
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-1
              ">
                Set a new password for this user.
              </p>

            </div>

            <form onSubmit={handleUpdatePassword}>

              {/* User ID */}

              <div className="mb-4">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  User ID
                </label>

                <input
                  type="text"
                  value={
                    selectedUser?.user_id || ""
                  }
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-200
                    bg-gray-100
                    rounded-xl
                    px-4
                    py-3
                    text-gray-600
                    cursor-not-allowed
                  "
                />

              </div>

              {/* User Name */}

              <div className="mb-4">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  User
                </label>

                <input
                  type="text"
                  value={
                    selectedUser?.name || ""
                  }
                  readOnly
                  className="
                    w-full
                    border
                    border-gray-200
                    bg-gray-100
                    rounded-xl
                    px-4
                    py-3
                    text-gray-600
                    cursor-not-allowed
                  "
                />

              </div>

              {/* New Password */}

              <div className="mb-4">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  New Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={passwordData.password}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  minLength="6"
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-200
                    focus:outline-none
                  "
                />

              </div>

              {/* Confirm Password */}

              <div className="mb-6">

                <label className="
                  block
                  text-sm
                  font-semibold
                  text-gray-700
                  mb-2
                ">
                  Confirm Password
                </label>

                <input
                  type="password"
                  name="password_confirmation"
                  value={
                    passwordData.password_confirmation
                  }
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  minLength="6"
                  required
                  className="
                    w-full
                    border
                    border-gray-300
                    rounded-xl
                    px-4
                    py-3
                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-200
                    focus:outline-none
                  "
                />

              </div>

              {/* Buttons */}

              <div className="
                flex
                justify-end
                gap-3
              ">

                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={updatingPassword}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-gray-300
                    text-gray-700
                    font-medium
                    hover:bg-gray-50
                    transition
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="
                    px-5
                    py-3
                    rounded-xl
                    bg-orange-500
                    hover:bg-orange-600
                    text-white
                    font-semibold
                    transition
                    disabled:opacity-50
                    disabled:cursor-not-allowed
                  "
                >
                  {updatingPassword
                    ? "Updating..."
                    : "Save Password"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

export default All_users;
