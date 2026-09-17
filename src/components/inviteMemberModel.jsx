import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import api from "./services/api";

export default function InviteMemberModal({ teamId, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!teamId || teamId === "undefined") {
      setMessage({
        type: "error",
        text: "Team ID is missing. Please select a valid team and try again.",
      });
      return;
    }

    setLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const res = await api.post(`/api/invitations/team/${teamId}`, {
        inviteeEmail: sanitizedEmail,
        role: role.toLowerCase(),
      });

      setMessage({
        type: "success",
        text: res.data?.message || "Invitation sent successfully!",
      });

      setEmail("");

      if (onSuccess) {
        onSuccess(res.data);
      }
    } catch (error) {
      console.error("Invite API Error:", error.response);

      const backendError =
        error.response?.data?.message ||
        (error.response?.status === 401
          ? "Unauthorized: Please log in again."
          : error.response?.status === 404
            ? "Route or team not found."
            : "Failed to send invitation. Please try again.");

      setMessage({
        type: "error",
        text: backendError,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative border border-slate-100">
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
        >
          <IoMdClose size={20} />
        </button>
      )}

      <h2 className="text-lg font-bold text-slate-800 mb-4">
        Invite Team Member
      </h2>

      {message && (
        <div
          className={`p-3 rounded-lg text-xs mb-4 font-medium ${
            message.type === "success"
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
              : "bg-rose-100 text-rose-800 border border-rose-200"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-slate-600">
            User Email
          </label>
          <input
            type="email"
            required
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600">
            Assign Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white cursor-pointer transition"
          >
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Sending..." : "Send Invitation"}
        </button>
      </form>
    </div>
  );
}
