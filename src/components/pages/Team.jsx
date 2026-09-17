import React, { useState, useEffect } from "react";
import {
  FaUsers,
  FaTrash,
  FaPlus,
  FaPaperPlane,
  FaTimes,
  FaSearch,
  FaUserPlus,
} from "react-icons/fa";
import api from "../services/api";
import InviteMemberModal from "../inviteMemberModel";

export default function Team() {
  const [teams, setTeams] = useState([]);
  const [openModel, setOpenModel] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [teamData, setTeamData] = useState({
    teamName: "",
    members: [], // Stores selected user ID strings
  });
  const [users, setUsers] = useState([]);

  // State for Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Fetch unassigned users
  const getUnAssignedUser = async () => {
    try {
      const res = await api.get("/teams/getUnAssignedUsers");
      if (res.data) {
        setUsers(res.data.users || res.data.unAssigned || []);
      }
    } catch (err) {
      console.error("Error fetching unassigned users:", err);
    }
  };

  useEffect(() => {
    getUnAssignedUser();
  }, []);

  // Fetch all teams
  const getTeams = async () => {
    try {
      const res = await api.get("/teams/getTeams");
      if (res.data) {
        setTeams(res.data.teams || []);
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

  // Create team request handler
  const handleTeamCreation = async () => {
    if (!teamData.teamName.trim()) {
      alert("Please enter a team name.");
      return;
    }
    try {
      const res = await api.post("/teams/createTeam", teamData);
      alert(res.data.message || "Team created successfully");
      setTeamData({ teamName: "", members: [] });
      setOpenModel(false);
      setUserSearchTerm("");
      getTeams();
      getUnAssignedUser(); // Refresh unassigned users list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create team");
    }
  };

  // Delete team request handler
  const handleDeleteTeam = async (id) => {
    if (!window.confirm("Delete this team? This cannot be undone.")) return;
    try {
      const res = await api.delete(`/teams/removeTeam/${id}`);
      if (res.data) {
        alert(res.data.message || "Team deleted successfully");
        getTeams();
        getUnAssignedUser(); // Refresh unassigned users list
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete team");
    }
  };

  const handleTeam = (e) => {
    const { name, value } = e.target;
    setTeamData((prev) => ({ ...prev, [name]: value }));
  };

  // Toggle user ID in team members selection state
  const handleToggleMember = (id) => {
    setTeamData((prev) => {
      const exists = prev.members.includes(id);
      return {
        ...prev,
        members: exists
          ? prev.members.filter((memberId) => memberId !== id)
          : [...prev.members, id],
      };
    });
  };

  const handleOpenInviteModal = (teamId) => {
    setSelectedTeamId(teamId);
    setInviteModalOpen(true);
  };

  const handleCloseInviteModal = () => {
    setInviteModalOpen(false);
    setSelectedTeamId(null);
  };

  const getProgressColor = (progress) => {
    if (!progress || progress < 20) return "bg-rose-500";
    if (progress < 70) return "bg-amber-500";
    if (progress === 100) return "bg-emerald-500";
    return "bg-indigo-500";
  };

  // Filter unassigned users based on search
  const filteredUsers = users.filter((u) => {
    const nameStr = u.name || u.username || "";
    const emailStr = u.email || "";
    const query = userSearchTerm.toLowerCase();
    return (
      nameStr.toLowerCase().includes(query) ||
      emailStr.toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Team Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize team members, assign workloads, and track progress.
          </p>
        </div>
        <button
          className="flex items-center gap-2 text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-all shadow-sm active:scale-95"
          onClick={() => setOpenModel(true)}
        >
          <FaPlus size={12} />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Team Cards Grid */}
      <div className="w-full">
        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
            <FaUsers className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-600">
              No active teams found.
            </p>
            <button
              onClick={() => setOpenModel(true)}
              className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              + Create your first team
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {teams.map((team) => (
              <div
                key={team._id || team.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                {/* Team Info */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-wide uppercase">
                      {team.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2.5 py-0.5 rounded-full font-medium">
                        <FaUsers className="text-slate-400 text-xs" />
                        {team.members?.length || 0} Members
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-1.5 w-full sm:w-64">
                    <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                      <span>Overall Progress</span>
                      <span>{team.teamProgress || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out ${getProgressColor(
                          team?.teamProgress,
                        )}`}
                        style={{ width: `${team?.teamProgress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 shrink-0">
                  <button
                    onClick={() => handleOpenInviteModal(team._id || team.id)}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 rounded-xl text-xs font-semibold transition-colors"
                  >
                    <FaPaperPlane className="text-xs" />
                    <span>Invite</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTeam(team._id || team.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-transparent hover:border-rose-100"
                    title="Delete Team"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal Overlay */}
      {openModel && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <FaUserPlus className="text-emerald-600" />
                Create New Team
              </h3>
              <button
                onClick={() => setOpenModel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* Modal Form */}
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Team Name
                </label>
                <input
                  type="text"
                  name="teamName"
                  placeholder="e.g. Frontend Engineering"
                  onChange={handleTeam}
                  value={teamData.teamName}
                  className="w-full bg-slate-50 p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm font-medium text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Select Unassigned Members ({teamData.members.length}{" "}
                    selected)
                  </span>
                </div>

                {/* Filter Input */}
                {users.length > 0 && (
                  <div className="relative">
                    <FaSearch className="absolute left-3 top-3 text-slate-400 text-xs" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Users List */}
                <ul className="max-h-44 overflow-y-auto space-y-1 bg-slate-50/50 p-2 rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <li className="text-xs text-slate-400 p-3 text-center">
                      No matching unassigned users found.
                    </li>
                  ) : (
                    filteredUsers.map((user) => {
                      const isChecked = teamData.members.includes(user._id);

                      return (
                        <li
                          key={user._id || user.name}
                          onClick={() => handleToggleMember(user._id)}
                          className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-emerald-50/80 text-emerald-900 font-semibold"
                              : "hover:bg-slate-100 text-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}} // Controlled by li onClick
                              className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate">
                                {user.name || user.username}
                              </span>
                              <span className="text-[10px] text-slate-400 truncate">
                                {user.email}
                              </span>
                            </div>
                          </div>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleTeamCreation}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-semibold text-xs transition shadow-sm active:scale-[0.98]"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Email Invitation Overlay Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <InviteMemberModal
            teamId={selectedTeamId}
            onClose={handleCloseInviteModal}
            onSuccess={() => {
              setTimeout(handleCloseInviteModal, 1200);
            }}
          />
        </div>
      )}
    </div>
  );
}
