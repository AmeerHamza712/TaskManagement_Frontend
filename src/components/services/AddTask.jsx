import React, { useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  CheckCircle2,
  UserCheck,
  Users,
  ListTodo,
  Loader2,
  X,
} from "lucide-react";
import api from "../services/api";

export default function AddTaskModal({
  isOpen,
  onClose,
  loginUser,
  onTaskAdded,
}) {
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTeams, setFetchingTeams] = useState(false);
  const [fetchingMembers, setFetchingMembers] = useState(false);

  const [task, setTask] = useState({
    title: "",
    teamName: "",
    userName: "",
    subTask: [],
  });

  const currentUserId = loginUser?._id || loginUser?.user || loginUser?.id;

  useEffect(() => {
    if (isOpen) {
      getTeams();
    }
  }, [isOpen]);

  const getTeams = async () => {
    setFetchingTeams(true);
    try {
      const res = await api.get("/teams/getTeams");
      const teamsData =
        res.data?.teams ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      setTeams(teamsData);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setFetchingTeams(false);
    }
  };

  useEffect(() => {
    if (!task.teamName) {
      setUsers([]);
      return;
    }

    const getTeamMembers = async () => {
      setFetchingMembers(true);
      try {
        const res = await api.get(`/teams/getTeamMembers/${task.teamName}`);
        const membersList =
          res.data?.TeamMember ||
          res.data?.members ||
          res.data?.users ||
          (Array.isArray(res.data) ? res.data : []);

        setUsers(membersList);
      } catch (error) {
        console.error("Error fetching team members:", error);
        setUsers([]);
      } finally {
        setFetchingMembers(false);
      }
    };

    getTeamMembers();
  }, [task.teamName]);

  const handleMainTask = (e) => {
    const { name, value } = e.target;
    if (name === "teamName") {
      setTask((prev) => ({ ...prev, teamName: value, userName: "" }));
    } else {
      setTask((prev) => ({ ...prev, [name]: value }));
    }
  };

  const newSubTask = () => {
    setTask((prev) => ({
      ...prev,
      subTask: [...prev.subTask, { id: Date.now(), SubTitle: "" }],
    }));
  };

  const handleSubTaskChange = (id, value) => {
    setTask((prev) => ({
      ...prev,
      subTask: prev.subTask.map((sub) =>
        sub.id === id ? { ...sub, SubTitle: value } : sub,
      ),
    }));
  };

  const removeSubTask = (id) => {
    setTask((prev) => ({
      ...prev,
      subTask: prev.subTask.filter((sub) => sub.id !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Error: Logged-in user session expired. Please log in again.");
      return;
    }

    const payload = {
      title: task.title,
      team: task.teamName,
      assignedTo: task.userName,
      assignedBy: currentUserId,
      subTask: task.subTask
        .filter((sub) => sub.SubTitle.trim() !== "")
        .map((sub) => ({
          title: sub.SubTitle.trim(),
          completed: false,
        })),
    };

    setLoading(true);
    try {
      const res = await api.post("/addTask", payload);
      alert(res.data?.message || "Task created successfully!");

      setTask({ title: "", teamName: "", userName: "", subTask: [] });
      setUsers([]);
      if (onTaskAdded) onTaskAdded();
      if (onClose) onClose();
    } catch (error) {
      console.error("Error creating task:", error);
      alert(error.response?.data?.message || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
              Assign New Task
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a task and assign it to a team member.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Task Title
            </label>
            <input
              type="text"
              name="title"
              value={task.title}
              onChange={handleMainTask}
              placeholder="e.g. Build Dashboard API Integration"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 outline-none transition-all"
              required
            />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Subtasks ({task.subTask.length})
              </label>
              <button
                type="button"
                onClick={newSubTask}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Add Subtask</span>
              </button>
            </div>

            {task.subTask.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-4 text-center bg-slate-50/50">
                <ListTodo className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">No subtasks added yet.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {task.subTask.map((sub, index) => (
                  <div key={sub.id} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-400 w-4 text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={sub.SubTitle}
                      onChange={(e) =>
                        handleSubTaskChange(sub.id, e.target.value)
                      }
                      placeholder="Subtask description..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => removeSubTask(sub.id)}
                      className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Team
            </label>
            <div className="relative">
              <select
                name="teamName"
                value={task.teamName}
                onChange={handleMainTask}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none appearance-none cursor-pointer"
                required
              >
                <option value="">
                  {fetchingTeams ? "Loading teams..." : "Choose a team..."}
                </option>
                {teams.map((team) => (
                  <option key={team._id || team.id} value={team._id || team.id}>
                    {team.name || team.teamName || "Unnamed Team"}
                  </option>
                ))}
              </select>
              {fetchingTeams ? (
                <Loader2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 animate-spin" />
              ) : (
                <Users className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Assignee
            </label>
            <div className="relative">
              <select
                name="userName"
                value={task.userName}
                onChange={handleMainTask}
                disabled={!task.teamName || fetchingMembers}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:bg-white focus:border-emerald-500 outline-none appearance-none cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                required
              >
                <option value="">
                  {!task.teamName
                    ? "Select a team first"
                    : fetchingMembers
                      ? "Loading members..."
                      : "Choose team member..."}
                </option>
                {users.map((item) => {
                  const memberId = item._id || item.user?._id || item.id;
                  const memberName =
                    item.name ||
                    item.user?.name ||
                    item.email ||
                    "Unknown User";
                  return (
                    <option key={memberId} value={memberId}>
                      {memberName}
                    </option>
                  );
                })}
              </select>
              {fetchingMembers ? (
                <Loader2 className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Assigned By
            </label>
            <input
              type="text"
              value={
                loginUser?.name ||
                loginUser?.user?.name ||
                currentUserId ||
                "Loading..."
              }
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !currentUserId}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-semibold py-3 px-4 rounded-xl shadow-sm disabled:bg-slate-300 disabled:cursor-not-allowed transition-all text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Task...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Create Task</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
