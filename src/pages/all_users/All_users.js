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
        error?.response?.data?.message || "Failed to load users"
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
    const filtered = users.filter(
      (user) =>
        user.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        user.email
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
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
      toast.error("Password must be at least 6 characters");
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
      console.error("Password update error:", error);

      const validationErrors =
        error?.response?.data?.error_message;

      if (validationErrors?.password) {
        toast.error(validationErrors.password[0]);
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

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="min-h-screen bg-black/60 py-4 sm:py-6 lg:py-8 px-3 sm:px-4 lg:px-6">
      <div className="max-w-[1600px] mx-auto">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            sm:rounded-3xl
            mb-5
            sm:mb-7
            px-5
            py-6
            sm:px-8
            sm:py-8
            lg:px-10
            lg:py-9
            bg-gradient-to-br
            from-[#2b2110]
            via-[#17130d]
            to-[#0d0b08]
            border
            border-[#D4AF37]
            shadow-[0_15px_50px_rgba(0,0,0,0.45)]
          "
        >
          {/* Decorative glow */}
          <div
            className="
              absolute
              -right-20
              -top-20
              w-56
              h-56
              rounded-full
              bg-[#d4af37]/10
              blur-3xl
            "
          />

          <div
            className="
              absolute
              -left-20
              -bottom-24
              w-48
              h-48
              rounded-full
              bg-[#b8860b]/10
              blur-3xl
            "
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div
                className="
                  w-10
                  h-10
                  sm:w-12
                  sm:h-12
                  rounded-xl
                  bg-gradient-to-br
                  from-[#f5d76e]
                  to-[#b8860b]
                  flex
                  items-center
                  justify-center
                  shadow-lg
                  shadow-[#d4af37]/20
                "
              >
                <span className="text-[#17130d] text-lg sm:text-xl font-black">
                  U
                </span>
              </div>

              <div>
                <h1
                  className="
                    text-2xl
                    sm:text-3xl
                    lg:text-4xl
                    font-bold
                    text-[#D4AF37]
                    tracking-tight
                  "
                >
                  All Users
                </h1>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#D4AF37]">
              Manage and view all registered users
            </p>
          </div>
        </div>

        {/* ==========================================
            MAIN CARD
        ========================================== */}

        <div
          className="
            bg-[#17130d]
            rounded-2xl
            sm:rounded-3xl
            border
            border-[#6f5517]/60
            shadow-[0_15px_50px_rgba(0,0,0,0.4)]
            overflow-hidden
          "
        >

          {/* ==========================================
              TOP BAR
          ========================================== */}

          <div
            className="
              p-4
              sm:p-5
              lg:p-6
              flex
              flex-col
              lg:flex-row
              gap-4
              lg:gap-6
              justify-between
              items-stretch
              lg:items-center
              border-b
              border-[#6f5517]/50
              bg-[#1c170e]
            "
          >
            {/* Records Select */}

            <div className="flex items-center justify-between sm:justify-start gap-3">
              <label
                className="
                  text-xs
                  sm:text-sm
                  font-medium
                  text-[#c8b98a]
                  whitespace-nowrap
                "
              >
                Show
              </label>

              <select
                value={usersPerPage}
                onChange={(e) => {
                  setUsersPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="
                  bg-[#0f0d09]
                  border
                  border-[#705817]
                  text-[#ead68a]
                  rounded-xl
                  px-3
                  sm:px-4
                  py-2.5
                  text-sm
                  focus:border-[#d4af37]
                  focus:ring-2
                  focus:ring-[#d4af37]/20
                  focus:outline-none
                  cursor-pointer
                "
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>

              <span className="text-xs sm:text-sm text-[#8f835f]">
                entries
              </span>
            </div>

            {/* Search */}

            <div className="relative w-full lg:w-[420px]">
              <span
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-[#b89632]
                  text-lg
                "
              >
                ⌕
              </span>

              <input
                type="text"
                placeholder="Search name, email or phone..."
                className="
                  w-full
                  bg-[#0f0d09]
                  border
                  border-[#705817]
                  rounded-xl
                  pl-11
                  pr-4
                  py-3
                  text-sm
                  text-[#eee1ad]
                  placeholder:text-[#756b50]
                  focus:border-[#d4af37]
                  focus:ring-2
                  focus:ring-[#d4af37]/20
                  focus:outline-none
                  transition
                "
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
              />
            </div>
          </div>

          {/* ==========================================
              TABLE WRAPPER
          ========================================== */}

          <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-[#705817] scrollbar-track-[#17130d]">
            <table className="w-full min-w-[1050px] border-collapse">

              {/* TABLE HEADER */}

              <thead>
                <tr
                  className="
                    bg-gradient-to-r
                    from-[#2a2110]
                    via-[#211a0d]
                    to-[#2a2110]
                    border-b
                    border-[#8b6914]
                  "
                >
                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    User ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Name
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Email
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Phone
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Joined On
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Action
                  </th>
                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody className="divide-y divide-[#3d321c]">

                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="
                        group
                        bg-[#17130d]
                        hover:bg-[#241c0d]
                        transition-all
                        duration-200
                      "
                    >

                      {/* ID */}

                      <td className="px-5 py-4">
                        <span
                          className="
                            inline-flex
                            items-center
                            justify-center
                            min-w-[42px]
                            px-2
                            py-1
                            rounded-lg
                            bg-[#262014]
                            border
                            border-[#4e411f]
                            text-xs
                            font-semibold
                            text-[#a99a70]
                          "
                        >
                          #{user.id}
                        </span>
                      </td>

                      {/* USER ID */}

                      <td className="px-5 py-4">
                        <span
                          className="
                            inline-flex
                            px-3
                            py-1.5
                            rounded-lg
                            bg-[#3a2c0f]
                            border
                            border-[#705817]
                            text-sm
                            font-semibold
                            text-[#e3bd45]
                          "
                        >
                          {user.user_id || "N/A"}
                        </span>
                      </td>

                      {/* NAME */}

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                              w-9
                              h-9
                              rounded-full
                              bg-gradient-to-br
                              from-[#e6c85c]
                              to-[#8f6910]
                              flex
                              items-center
                              justify-center
                              text-[#17130d]
                              font-bold
                              text-sm
                              flex-shrink-0
                            "
                          >
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <span
                            className="
                              font-semibold
                              text-[#eee1ad]
                              whitespace-nowrap
                            "
                          >
                            {user.name || "N/A"}
                          </span>
                        </div>
                      </td>

                      {/* EMAIL */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-[#b9ad88]">
                          {user.email || "N/A"}
                        </span>
                      </td>

                      {/* PHONE */}

                      <td className="px-5 py-4">
                        <span className="text-sm text-[#b9ad88]">
                          {user.phone || "N/A"}
                        </span>
                      </td>

                      {/* JOINED DATE */}

                      <td className="px-5 py-4">
                        <span
                          className="
                            text-sm
                            text-[#9e936f]
                            whitespace-nowrap
                          "
                        >
                          {user.created_at
                            ? new Date(
                                user.created_at
                              ).toLocaleDateString(
                                "en-IN"
                              )
                            : "N/A"}
                        </span>
                      </td>

                      {/* ACTION */}

                      <td className="px-5 py-4 text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenPasswordModal(user)
                          }
                          className="
                            inline-flex
                            items-center
                            justify-center
                            px-4
                            py-2.5
                            rounded-xl
                            bg-gradient-to-r
                            from-[#d4af37]
                            to-[#a77c0b]
                            hover:from-[#e6c85c]
                            hover:to-[#c1941c]
                            text-[#17130d]
                            text-xs
                            sm:text-sm
                            font-bold
                            shadow-md
                            shadow-[#d4af37]/10
                            transition-all
                            duration-200
                            hover:-translate-y-0.5
                            whitespace-nowrap
                          "
                        >
                          Update Password
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (

                  /* EMPTY STATE */

                  <tr>
                    <td
                      colSpan="7"
                      className="py-16 text-center"
                    >
                      <div className="flex flex-col items-center justify-center">

                        <div
                          className="
                            w-16
                            h-16
                            rounded-full
                            bg-[#28200f]
                            border
                            border-[#5c4917]
                            flex
                            items-center
                            justify-center
                            mb-4
                          "
                        >
                          <span className="text-2xl text-[#9b7820]">
                            ⌕
                          </span>
                        </div>

                        <p className="text-[#d1c39b] font-semibold">
                          No users found
                        </p>

                        <p className="text-sm text-[#776d53] mt-1">
                          Try changing your search keyword.
                        </p>

                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ==========================================
              PAGINATION
          ========================================== */}

          <div
            className="
              px-4
              sm:px-6
              py-4
              sm:py-5
              flex
              flex-col
              lg:flex-row
              gap-4
              justify-between
              items-center
              border-t
              border-[#6f5517]/50
              bg-[#1c170e]
            "
          >

            {/* Showing Count */}

            <span
              className="
                text-xs
                sm:text-sm
                text-[#9f936f]
                text-center
                lg:text-left
              "
            >
              Showing{" "}
              <span className="font-semibold text-[#d4af37]">
                {filteredUsers.length === 0
                  ? 0
                  : indexOfFirstUser + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-[#d4af37]">
                {Math.min(
                  indexOfLastUser,
                  filteredUsers.length
                )}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-[#d4af37]">
                {filteredUsers.length}
              </span>{" "}
              users
            </span>

            {/* Pagination */}

            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">

              {/* Previous */}

              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.max(prev - 1, 1)
                  )
                }
                disabled={currentPage === 1}
                className="
                  px-3
                  sm:px-4
                  py-2
                  rounded-lg
                  border
                  border-[#5d4a1d]
                  bg-[#17130d]
                  text-[#c4b47d]
                  text-xs
                  sm:text-sm
                  font-medium
                  hover:border-[#b89632]
                  hover:text-[#e3c65b]
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition
                "
              >
                ← Previous
              </button>

              {/* Page Numbers */}

              <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
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
                      min-w-[36px]
                      h-[36px]
                      px-2
                      rounded-lg
                      text-xs
                      sm:text-sm
                      font-semibold
                      transition-all
                      ${
                        currentPage === page
                          ? "bg-gradient-to-br from-[#e1c24d] to-[#9c730b] text-[#17130d] shadow-md shadow-[#d4af37]/10"
                          : "bg-[#17130d] border border-[#5d4a1d] text-[#b6a979] hover:border-[#b89632] hover:text-[#e3c65b]"
                      }
                    `}
                  >
                    {page}
                  </button>
                ))}
              </div>

              {/* Next */}

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
                  px-3
                  sm:px-4
                  py-2
                  rounded-lg
                  border
                  border-[#5d4a1d]
                  bg-[#17130d]
                  text-[#c4b47d]
                  text-xs
                  sm:text-sm
                  font-medium
                  hover:border-[#b89632]
                  hover:text-[#e3c65b]
                  disabled:opacity-30
                  disabled:cursor-not-allowed
                  transition
                "
              >
                Next →
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
            bg-black/75
            backdrop-blur-sm
            px-3
            sm:px-4
            py-4
          "
          onClick={handleClosePasswordModal}
        >
          <div
            className="
              bg-[#17130d]
              w-full
              max-w-md
              max-h-[95vh]
              overflow-y-auto
              rounded-2xl
              sm:rounded-3xl
              border
              border-[#8b6914]/70
              shadow-[0_25px_80px_rgba(0,0,0,0.65)]
              p-5
              sm:p-7
            "
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* Modal Header */}

            <div
              className="
                flex
                items-start
                justify-between
                gap-4
                mb-6
              "
            >
              <div>
                <h2
                  className="
                    text-xl
                    sm:text-2xl
                    font-bold
                    text-[#e8cc63]
                  "
                >
                  Update Password
                </h2>

                <p className="text-xs sm:text-sm text-[#948762] mt-1">
                  Set a new password for this user.
                </p>
              </div>

              <button
                type="button"
                onClick={handleClosePasswordModal}
                disabled={updatingPassword}
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-[#251d0e]
                  border
                  border-[#56461d]
                  text-[#b5a46f]
                  hover:text-[#e4c75c]
                  hover:border-[#a27b16]
                  transition
                "
              >
                ×
              </button>
            </div>

            <form onSubmit={handleUpdatePassword}>

              {/* User ID */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-[#cbbb8a]
                    mb-2
                  "
                >
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
                    border-[#4c411f]
                    bg-[#100e0a]
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-[#938661]
                    cursor-not-allowed
                  "
                />
              </div>

              {/* User Name */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-[#cbbb8a]
                    mb-2
                  "
                >
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
                    border-[#4c411f]
                    bg-[#100e0a]
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-[#938661]
                    cursor-not-allowed
                  "
                />
              </div>

              {/* New Password */}

              <div className="mb-4">
                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-[#cbbb8a]
                    mb-2
                  "
                >
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
                    border-[#66521e]
                    bg-[#100e0a]
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-[#eee1ad]
                    placeholder:text-[#655c46]
                    focus:border-[#d4af37]
                    focus:ring-2
                    focus:ring-[#d4af37]/20
                    focus:outline-none
                    transition
                  "
                />
              </div>

              {/* Confirm Password */}

              <div className="mb-6">
                <label
                  className="
                    block
                    text-xs
                    sm:text-sm
                    font-semibold
                    text-[#cbbb8a]
                    mb-2
                  "
                >
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
                    border-[#66521e]
                    bg-[#100e0a]
                    rounded-xl
                    px-4
                    py-3
                    text-sm
                    text-[#eee1ad]
                    placeholder:text-[#655c46]
                    focus:border-[#d4af37]
                    focus:ring-2
                    focus:ring-[#d4af37]/20
                    focus:outline-none
                    transition
                  "
                />
              </div>

              {/* Buttons */}

              <div
                className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  justify-end
                  gap-3
                "
              >
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={updatingPassword}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                    border
                    border-[#5c4b21]
                    bg-[#17130d]
                    text-[#b9ab82]
                    text-sm
                    font-medium
                    hover:border-[#94711a]
                    hover:text-[#dfc25b]
                    transition
                    disabled:opacity-40
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="
                    w-full
                    sm:w-auto
                    px-5
                    py-3
                    rounded-xl
                    bg-gradient-to-r
                    from-[#d8b63f]
                    to-[#9f760c]
                    hover:from-[#e8ca5a]
                    hover:to-[#b98b16]
                    text-[#17130d]
                    text-sm
                    font-bold
                    shadow-lg
                    shadow-[#d4af37]/10
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

