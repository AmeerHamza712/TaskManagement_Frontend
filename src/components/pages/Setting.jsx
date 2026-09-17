import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Profile from "./Profile";
import api from "../services/api";

export default function Setting() {
  const loginUser = useOutletContext();
  const [activeTab, setActiveTab] = useState("profile");

  // Manage Team Tab States
  const [teams, setTeams] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [teamMessage, setTeamMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    teamId: "",
    userId: "",
  });

  // Notifications Tab States
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState("");

  // Fetch data dynamically based on the active tab
  useEffect(() => {
    if (activeTab === "team") {
      fetchTeamData();
    } else if (activeTab === "notifications") {
      fetchNotifications();
    }
  }, [activeTab]);

  // --- TEAM FUNCTIONS ---
  const fetchTeamData = async () => {
    try {
      setTeamLoading(true);
      const [teamsRes, usersRes] = await Promise.all([
        api.get("/teams/getTeams").catch(() => ({ data: [] })),
        api.get("/teams/getUnAssignedUsers").catch(() => ({ data: [] })),
      ]);

      // Normalize team array
      const fetchedTeams = Array.isArray(teamsRes.data)
        ? teamsRes.data
        : teamsRes.data?.teams || [];

      // Normalize user array
      const fetchedUsers = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data?.users || usersRes.data?.unAssigned || [];

      setTeams(fetchedTeams);
      setAvailableUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching team data:", err);
    } finally {
      setTeamLoading(false);
    }
  };

  const handleTeamChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setTeamMessage({ type: "", text: "" });

    if (!formData.teamId || !formData.userId) {
      setTeamMessage({
        type: "error",
        text: "Please select both a Team and a Member.",
      });
      return;
    }

    try {
      const res = await api.post(`/teams/addMember/${formData.teamId}`, {
        userId: formData.userId,
      });

      const successText =
        typeof res.data === "string"
          ? res.data
          : res.data?.message || "Member added successfully!";

      setTeamMessage({ type: "success", text: successText });
      setFormData({ teamId: "", userId: "" });
      fetchTeamData(); // Refresh available members list
    } catch (err) {
      const errorText =
        typeof err.response?.data === "string"
          ? err.response.data
          : err.response?.data?.message || "Failed to add member.";

      setTeamMessage({ type: "error", text: errorText });
    }
  };

  // --- NOTIFICATION FUNCTIONS ---
  const fetchNotifications = async () => {
    try {
      setNotifLoading(true);
      setNotifError("");
      const res = await api.get("/notifications");

      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];

      setNotifications(list);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setNotifError("Failed to load notifications.");
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.patch(`/notifications/${id}/read`);
      if (res.data?.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const res = await api.delete(`/notifications/${id}`);
      if (res.data?.success) {
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  return (
    <div className="flex min-h-[550px] w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Sidebar Navigation */}
      <div className="w-56 border-r border-slate-200 bg-slate-50 p-4 shrink-0">
        <h3 className="font-bold text-slate-700 mb-4">Settings Options</h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li
            onClick={() => setActiveTab("profile")}
            className={`p-2 rounded cursor-pointer transition-all ${
              activeTab === "profile"
                ? "bg-white shadow-sm text-emerald-600 font-medium"
                : "hover:bg-slate-200"
            }`}
          >
            👤 Profile Settings
          </li>
          <li
            onClick={() => setActiveTab("notifications")}
            className={`p-2 rounded cursor-pointer transition-all ${
              activeTab === "notifications"
                ? "bg-white shadow-sm text-emerald-600 font-medium"
                : "hover:bg-slate-200"
            }`}
          >
            🔔 Notifications
          </li>
          <li
            onClick={() => setActiveTab("team")}
            className={`p-2 rounded cursor-pointer transition-all ${
              activeTab === "team"
                ? "bg-white shadow-sm text-emerald-600 font-medium"
                : "hover:bg-slate-200"
            }`}
          >
            👥 Manage Team
          </li>
        </ul>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Profile activeTab={activeTab} loginUser={loginUser} />
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold mb-1 text-slate-800">
              Notification Preferences
            </h2>
            <p className="text-slate-600 mb-6 text-sm">
              View and manage your recent account alerts and task updates.
            </p>

            {notifLoading ? (
              <p className="text-slate-500 text-sm">Loading notifications...</p>
            ) : notifError ? (
              <p className="text-red-500 text-sm">{notifError}</p>
            ) : notifications.length === 0 ? (
              <p className="text-slate-500 text-sm">No notifications found.</p>
            ) : (
              <div className="space-y-3">
                {notifications.map((item) => (
                  <div
                    key={item._id}
                    className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                      item.isRead
                        ? "bg-slate-50 border-slate-200 opacity-75"
                        : "bg-white border-emerald-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.isRead ? "bg-slate-300" : "bg-emerald-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {item.message || item.task?.title || "New Activity"}
                        </p>
                        {item.sender?.name && (
                          <span className="text-xs text-slate-500">
                            From: {item.sender.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(item._id)}
                          className="text-xs text-emerald-600 font-semibold hover:underline border border-emerald-200 px-3 py-1 rounded-md bg-emerald-50"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(item._id)}
                        className="text-xs text-red-500 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
                        title="Delete Notification"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Manage Team Tab */}
        {activeTab === "team" && (
          <div className="max-w-md">
            <h2 className="text-xl font-bold mb-1 text-slate-800">
              Manage Your Teams
            </h2>
            <p className="text-slate-600 mb-4 text-sm">
              Assign members to existing teams.
            </p>

            {teamMessage.text && (
              <div
                className={`p-3 rounded-lg text-sm mb-4 ${
                  teamMessage.type === "error"
                    ? "bg-red-50 text-red-600 border border-red-200"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                }`}
              >
                {teamMessage.text}
              </div>
            )}

            <form onSubmit={handleTeamSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Select Team
                </label>
                <select
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleTeamChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                  disabled={teamLoading}
                >
                  <option value="">-- Choose a Team --</option>
                  {teams.map((team) => (
                    <option
                      key={team._id || team.id}
                      value={team._id || team.id}
                    >
                      {team.name || team.teamName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Select Member
                </label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleTeamChange}
                  className="w-full border border-slate-300 p-2.5 rounded-lg bg-white text-slate-800 focus:outline-none focus:border-emerald-500"
                  disabled={teamLoading}
                >
                  <option value="">-- Choose a User to Add --</option>
                  {availableUsers.length > 0 ? (
                    availableUsers.map((user) => {
                      const id = user._id || user.id;
                      const displayName =
                        user.name || user.username || user.email || "User";
                      return (
                        <option key={id} value={id}>
                          {displayName} {user.email ? `(${user.email})` : ""}
                        </option>
                      );
                    })
                  ) : (
                    <option value="" disabled>
                      No unassigned members available
                    </option>
                  )}
                </select>
              </div>

              <button
                type="submit"
                disabled={teamLoading}
                className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-medium hover:bg-emerald-700 transition-all shadow-sm disabled:opacity-50"
              >
                {teamLoading ? "Processing..." : "Add Member to Team"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
