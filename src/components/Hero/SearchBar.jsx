import React, { useEffect, useState, useRef } from "react";
import { FaSearch, FaBell, FaSpinner } from "react-icons/fa";
import { MdEmail, MdUploadFile } from "react-icons/md";
import api from "../services/api";

export default function SearchBar({ loginUser }) {
  const [profilePreview, setProfilePreview] = useState(null);

  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Email Invitation States
  const [invitations, setInvitations] = useState([]);
  const [showInviteDropdown, setShowInviteDropdown] = useState(false);

  // Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Container Refs for outside click handling
  const searchContainerRef = useRef(null);
  const inviteContainerRef = useRef(null);
  const notifContainerRef = useRef(null);

  const userEmail = loginUser?.email;

  // Handle outside clicks for all dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowSearchDropdown(false);
      }
      if (
        inviteContainerRef.current &&
        !inviteContainerRef.current.contains(e.target)
      ) {
        setShowInviteDropdown(false);
      }
      if (
        notifContainerRef.current &&
        !notifContainerRef.current.contains(e.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debouncing Search Query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const res = await api.get(
          `/search?query=${encodeURIComponent(searchTerm)}`,
        );
        const data = res.data.results || res.data || [];
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error performing search:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  // Fetch Notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get("/notifications");
      const data = res.data.data || res.data;
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch Team Invitations
  const fetchInvitations = async () => {
    if (!userEmail) return;
    try {
      const formattedEmail = userEmail.trim().toLowerCase();
      const res = await api.get(`/invitations/${formattedEmail}`);
      const data = res.data.invitations || res.data || [];
      setInvitations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchInvitations();

    const interval = setInterval(() => {
      fetchNotifications();
      fetchInvitations();
    }, 30000);

    return () => clearInterval(interval);
  }, [userEmail]);

  // Handle Invitation Actions
  const handleAcceptInvite = async (invitationId) => {
    try {
      await api.post("/invitations/accept", { invitationId });
      setInvitations((prev) => prev.filter((i) => i._id !== invitationId));
    } catch (error) {
      console.error("Error accepting invitation:", error);
    }
  };

  const handleRejectInvite = async (invitationId) => {
    try {
      await api.post("/invitations/reject", { invitationId });
      setInvitations((prev) => prev.filter((i) => i._id !== invitationId));
    } catch (error) {
      console.error("Error rejecting invitation:", error);
    }
  };

  // Handle Notification Read State
  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  // Profile Avatar Upload Handler
  const handleChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const previewUrl = URL.createObjectURL(selectedFile);
    setProfilePreview(previewUrl);

    const userId = loginUser?._id || loginUser?.id || loginUser?.user;
    if (!userId) {
      console.error("Cannot upload avatar: Missing user ID");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("avatar", selectedFile);

      const res = await api.post(`/upload-avatar/${userId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.avatar) {
        const path = res.data.avatar.startsWith("/")
          ? res.data.avatar
          : `/${res.data.avatar}`;
        const baseUrl = api.defaults.baseURL || "";
        const cleanBaseUrl = baseUrl.endsWith("/")
          ? baseUrl.slice(0, -1)
          : baseUrl;
        setProfilePreview(`${cleanBaseUrl}${path}`);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  };

  // Initial Avatar Loading & Prop Synchronization
  useEffect(() => {
    const rawAvatar = loginUser?.profile?.avatar || loginUser?.avatar;

    if (rawAvatar) {
      if (rawAvatar.startsWith("http") || rawAvatar.startsWith("blob:")) {
        setProfilePreview(rawAvatar);
      } else {
        const path = rawAvatar.startsWith("/") ? rawAvatar : `/${rawAvatar}`;
        const baseUrl = api.defaults.baseURL || "";
        const cleanBaseUrl = baseUrl.endsWith("/")
          ? baseUrl.slice(0, -1)
          : baseUrl;
        setProfilePreview(`${cleanBaseUrl}${path}`);
      }
    }
  }, [loginUser]);

  return (
    <div className="bg-slate-50 border border-slate-200 w-full rounded-2xl px-4 py-2.5 flex justify-between gap-4 items-center shadow-sm select-none">
      {/* Search Input Container */}
      <div
        ref={searchContainerRef}
        className="flex-shrink-0 min-w-0 flex-1 relative max-w-md"
      >
        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2.5 focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10 transition-all duration-200"
        >
          <span className="text-base flex-shrink-0 text-slate-400">
            {isSearching ? (
              <FaSpinner className="animate-spin text-green-500" />
            ) : (
              <FaSearch />
            )}
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.trim() && setShowSearchDropdown(true)}
            placeholder="Search tasks, teams, files..."
            className="min-w-0 outline-none bg-transparent w-full text-sm text-slate-800 placeholder-slate-400 font-normal"
          />
        </form>

        {/* Search Results Dropdown */}
        {showSearchDropdown && (
          <div className="absolute left-0 mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden max-h-72 overflow-y-auto">
            {isSearching ? (
              <p className="p-4 text-xs text-center text-slate-500 font-medium">
                Searching...
              </p>
            ) : searchResults.length === 0 ? (
              <p className="p-4 text-xs text-center text-slate-500 font-medium">
                No results found for "{searchTerm}"
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {searchResults.map((result, idx) => (
                  <div
                    key={result._id || idx}
                    onClick={() => setShowSearchDropdown(false)}
                    className="p-3 text-xs flex flex-col gap-1 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-slate-800">
                      {result.title || result.name || "Untitled"}
                    </p>
                    {result.description && (
                      <p className="text-slate-500 line-clamp-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex gap-3 items-center">
        {/* Email / Invitation Dropdown Icon */}
        <div className="relative" ref={inviteContainerRef}>
          <button
            type="button"
            onClick={() => {
              setShowInviteDropdown(!showInviteDropdown);
              setShowDropdown(false);
            }}
            className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-500/30 hover:bg-emerald-50/50 transition-all duration-200 relative outline-none cursor-pointer"
          >
            <MdEmail className="text-lg" />
            {invitations.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm border border-white">
                {invitations.length}
              </span>
            )}
          </button>

          {showInviteDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-semibold text-sm text-slate-800">
                  Team Invitations
                </h3>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {invitations.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-500 font-medium">
                    No pending invitations
                  </p>
                ) : (
                  invitations.map((item) => (
                    <div
                      key={item._id}
                      className="p-3.5 text-xs flex flex-col gap-2 bg-white hover:bg-slate-50/80 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <p className="font-semibold text-slate-800">
                          {item.teamId?.name || "Team Invitation"}
                        </p>
                        <p className="text-slate-500">
                          Invited by:{" "}
                          <span className="font-medium text-slate-700">
                            {item.invitedBy?.name ||
                              item.invitedBy?.email ||
                              "Team Owner"}
                          </span>
                        </p>
                        {item.role && (
                          <span className="inline-block mt-1 text-[10px] font-semibold bg-emerald-50 text-green-700 px-2 py-0.5 rounded-md w-max capitalize">
                            Role: {item.role}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleAcceptInvite(item._id)}
                          className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-green-600 shadow-sm shadow-green-500/20 transition-all duration-200"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectInvite(item._id)}
                          className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-medium hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Dropdown Icon */}
        <div className="relative" ref={notifContainerRef}>
          <button
            type="button"
            onClick={() => {
              setShowDropdown(!showDropdown);
              setShowInviteDropdown(false);
            }}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-green-600 hover:border-green-500/30 hover:bg-emerald-50/50 transition-all duration-200 relative outline-none cursor-pointer"
          >
            <FaBell className="text-base" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center shadow-sm border border-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
              <div className="p-3.5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-semibold text-sm text-slate-800">
                  Notifications
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <p className="p-4 text-xs text-center text-slate-500 font-medium">
                    No notifications yet
                  </p>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item._id}
                      onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                      className={`p-3.5 text-xs cursor-pointer transition-colors flex flex-col gap-1 ${
                        item.isRead
                          ? "bg-white text-slate-500"
                          : "bg-emerald-50/40 text-slate-800 font-medium"
                      } hover:bg-slate-50`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-slate-800">
                          {item.title}
                        </span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                        )}
                      </div>
                      <p className="text-slate-600 line-clamp-2 leading-relaxed">
                        {item.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-[1px] bg-slate-200 mx-1 hidden sm:block"></div>

        {/* User Profile Avatar Section */}
        <div className="flex gap-3 items-center">
          <div className="relative group">
            {profilePreview ? (
              <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border-2 border-white shadow-sm ring-1 ring-slate-200">
                <img
                  src={profilePreview}
                  alt="Profile avatar"
                  className="w-full h-full object-cover"
                  onError={() => setProfilePreview(null)}
                />
              </div>
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold text-base shadow-sm ring-1 ring-slate-200">
                {loginUser?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            )}

            <label
              htmlFor="profileUpload"
              className="absolute -bottom-1 -right-1 z-10 cursor-pointer rounded-full bg-white border border-slate-200 h-5 w-5 flex items-center justify-center text-slate-600 shadow-sm hover:text-green-600 hover:border-green-500/50 transition-all duration-200 active:scale-95"
              title="Upload new avatar"
            >
              <MdUploadFile className="text-xs" />
            </label>
          </div>

          <input
            type="file"
            id="profileUpload"
            name="avatar"
            accept="image/png, image/jpeg, image/jpg"
            onChange={handleChange}
            className="hidden"
          />

          <div className="hidden sm:flex flex-col">
            <h1 className="font-semibold text-xs text-slate-800 truncate max-w-[140px]">
              {loginUser?.name || "User"}
            </h1>
            <span className="text-[11px] text-slate-400 truncate max-w-[140px]">
              {userEmail || "Loading..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
