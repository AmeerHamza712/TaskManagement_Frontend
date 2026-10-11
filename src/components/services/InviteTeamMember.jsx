// import React, { useState, useEffect } from "react";
// import { IoMdClose } from "react-icons/io";
// import api from "./api";

// /**
//  * NOTE: This file was referenced by Hero.jsx (`import InviteTeamMember from
//  * "../services/InviteTeamMember"`) but wasn't included in the files you
//  * shared, so this is a reconstruction based on how it's used there:
//  *
//  *   {open && <InviteTeamMember onClose={() => setOpen(false)} />}
//  *
//  * Unlike InviteMemberModal.jsx (which requires a teamId to already be
//  * selected, e.g. from the Team page), this version lets the user pick a
//  * team themselves, since Hero.jsx opens it without a teamId in scope.
//  *
//  * Also worth double-checking: in Hero.jsx the button that opens this is
//  * labeled "Create Task", which doesn't match "invite a team member". If
//  * that's not what you intended, you may want to either rename the button
//  * or point it at a real "create task" flow instead.
//  */
// export default function InviteTeamMember({ onClose }) {
//   const [teams, setTeams] = useState([]);
//   const [teamId, setTeamId] = useState("");
//   const [email, setEmail] = useState("");
//   const [role, setRole] = useState("member");
//   const [loadingTeams, setLoadingTeams] = useState(true);
//   const [sending, setSending] = useState(false);
//   const [message, setMessage] = useState(null);

//   useEffect(() => {
//     const getTeams = async () => {
//       try {
//         setLoadingTeams(true);
//         const res = await api.get("/getTeams");
//         setTeams(res.data?.teams || []);
//       } catch (err) {
//         console.error("Error fetching teams:", err);
//         setTeams([]);
//       } finally {
//         setLoadingTeams(false);
//       }
//     };
//     getTeams();
//   }, []);

//   const handleSendInvite = async (e) => {
//     e.preventDefault();
//     setMessage(null);

//     if (!teamId) {
//       setMessage({ type: "error", text: "Please select a team first." });
//       return;
//     }

//     setSending(true);
//     try {
//       const sanitizedEmail = email.trim().toLowerCase();
//       const res = await api.post(`/api/invitations/saveInvitation`, {
//         inviteeEmail: sanitizedEmail,
//         role: role.toLowerCase(),
//       });

//       setMessage({
//         type: "success",
//         text: res.data?.message || "Invitation sent successfully!",
//       });
//       setEmail("");
//     } catch (error) {
//       console.error("Invite API Error:", error.response);
//       const backendError =
//         error.response?.data?.message ||
//         (error.response?.status === 401
//           ? "Unauthorized: Please log in again."
//           : error.response?.status === 404
//             ? "Route or team not found."
//             : "Failed to send invitation. Please try again.");
//       setMessage({ type: "error", text: backendError });
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//       <div className="bg-white p-6 rounded-2xl shadow-lg max-w-md w-full relative border border-slate-100">
//         {onClose && (
//           <button
//             type="button"
//             onClick={onClose}
//             className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
//           >
//             <IoMdClose size={20} />
//           </button>
//         )}

//         <h2 className="text-lg font-bold text-slate-800 mb-4">
//           Invite Team Member
//         </h2>

//         {message && (
//           <div
//             className={`p-3 rounded-lg text-xs mb-4 font-medium ${
//               message.type === "success"
//                 ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
//                 : "bg-rose-100 text-rose-800 border border-rose-200"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}

//         <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
//           <div>
//             <label className="text-xs font-semibold text-slate-600">Team</label>
//             <select
//               value={teamId}
//               onChange={(e) => setTeamId(e.target.value)}
//               className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white cursor-pointer transition disabled:bg-slate-100"
//               disabled={loadingTeams}
//               required
//             >
//               <option value="">
//                 {loadingTeams ? "Loading teams..." : "Select a team"}
//               </option>
//               {teams.map((team) => (
//                 <option key={team._id || team.id} value={team._id || team.id}>
//                   {team.name}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="text-xs font-semibold text-slate-600">
//               User Email
//             </label>
//             <input
//               type="email"
//               required
//               placeholder="user@example.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 transition"
//             />
//           </div>

//           <div>
//             <label className="text-xs font-semibold text-slate-600">
//               Assign Role TeamMemberModel
//             </label>
//             <select
//               value={role}
//               onChange={(e) => setRole(e.target.value)}
//               className="w-full mt-1 p-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500 bg-white cursor-pointer transition"
//             >
//               <option value="member">Member</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>

//           <button
//             type="submit"
//             // disabled={sending || !teamId}
//             className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition disabled:opacity-50 cursor-pointer"
//           >
//             {sending ? "Sending..." : "Send Invitation"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import api from "./api";

export default function InviteTeamMember({ onClose, onSuccess }) {
  const [teams, setTeams] = useState([]);
  const [teamId, setTeamId] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");

  const [loadingTeams, setLoadingTeams] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);

  // Fetch teams
  useEffect(() => {
    const getTeams = async () => {
      try {
        setLoadingTeams(true);

        const res = await api.get("/teams/getTeams");

        const fetchedTeams = Array.isArray(res.data?.teams)
          ? res.data.teams
          : Array.isArray(res.data)
            ? res.data
            : [];

        setTeams(fetchedTeams);
      } catch (error) {
        console.error("Error fetching teams:", error.response?.data || error);

        setMessage({
          type: "error",
          text:
            error.response?.data?.message ||
            "Could not load teams. Please try again.",
        });
      } finally {
        setLoadingTeams(false);
      }
    };

    getTeams();
  }, []);

  // Send invitation
  const handleSendInvite = async (e) => {
    e.preventDefault();
    setMessage(null);

    const sanitizedEmail = email.trim().toLowerCase();

    if (!teamId) {
      setMessage({
        type: "error",
        text: "Please select a team first.",
      });
      return;
    }

    if (!sanitizedEmail) {
      setMessage({
        type: "error",
        text: "Please enter an email address.",
      });
      return;
    }

    setSending(true);

    try {
      const res = await api.post(`/api/invitations/saveInvitation/${teamId}`, {
        inviteeEmail: sanitizedEmail,
        role,
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
      console.error("Invite API Error:", error.response?.data || error);

      let errorMessage =
        error.response?.data?.message ||
        "Failed to send invitation. Please try again.";

      if (error.response?.status === 401) {
        errorMessage = "Unauthorized. Please log in again.";
      } else if (error.response?.status === 404) {
        errorMessage =
          error.response?.data?.message ||
          "Invitation route or requested resource not found.";
      }

      setMessage({
        type: "error",
        text: errorMessage,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
        {/* Close button */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close invitation modal"
            className="absolute right-4 top-4 text-slate-400 transition hover:text-slate-600"
          >
            <IoMdClose size={20} />
          </button>
        )}

        <h2 className="mb-4 text-lg font-bold text-slate-800">
          Invite Team Member
        </h2>

        {/* Success or error message */}
        {message && (
          <div
            role="alert"
            className={`mb-4 rounded-lg border p-3 text-xs font-medium ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-100 text-emerald-800"
                : "border-rose-200 bg-rose-100 text-rose-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSendInvite} className="flex flex-col gap-4">
          {/* Team selection */}
          <div>
            <label
              htmlFor="team"
              className="text-xs font-semibold text-slate-600"
            >
              Select Team
            </label>

            <select
              id="team"
              value={teamId}
              onChange={(e) => setTeamId(e.target.value)}
              disabled={loadingTeams || sending}
              required
              className="mt-1 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="">
                {loadingTeams ? "Loading teams..." : "Select a team"}
              </option>

              {teams.map((team) => (
                <option key={team._id || team.id} value={team._id || team.id}>
                  {team.name}
                </option>
              ))}
            </select>

            {!loadingTeams && teams.length === 0 && (
              <p className="mt-1 text-xs text-slate-500">
                No teams found. Please check your teams API.
              </p>
            )}
          </div>

          {/* Member email */}
          <div>
            <label
              htmlFor="inviteEmail"
              className="text-xs font-semibold text-slate-600"
            >
              Member Email
            </label>

            <input
              id="inviteEmail"
              type="email"
              required
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={sending}
              className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-100"
            />
          </div>

          {/* Role selection */}
          <div>
            <label
              htmlFor="role"
              className="text-xs font-semibold text-slate-600"
            >
              Assign Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={sending}
              className="mt-1 w-full cursor-pointer rounded-lg border border-slate-300 bg-white p-2 text-sm outline-none transition focus:border-blue-500 disabled:bg-slate-100"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={sending || loadingTeams || teams.length === 0}
            className="cursor-pointer rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Invitation"}
          </button>
        </form>
      </div>
    </div>
  );
}
