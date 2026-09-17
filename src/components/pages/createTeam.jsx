import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import teamImage from "../../assets/team.png";

function CreateTeam({ loginUser }) {
  const navigate = useNavigate();

  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleAddMember = () => {
    const email = memberEmail.trim().toLowerCase();
    if (!email) return;
    if (invitedEmails.includes(email)) {
      setMemberEmail("");
      return;
    }
    setInvitedEmails((prev) => [...prev, email]);
    setMemberEmail("");
  };

  const handleRemoveMember = (email) => {
    setInvitedEmails((prev) => prev.filter((e) => e !== email));
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (!teamName.trim()) {
      setMessage({ text: "Please enter a team name.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/createTeam", {
        teamName: teamName.trim(),
        description: teamDescription.trim(),
        invites: invitedEmails,
      });

      setMessage({
        text: res.data?.message || "Team created successfully!",
        type: "success",
      });

      setTimeout(() => navigate("/dashboard/team"), 800);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Failed to create team.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="w-full ">
        <div>
          <Navbar loginUser={loginUser} />
        </div>
        <div className="w-full max-w-md-5xl bg-white mx-auto p-4 shadow-md">
          <h1 className="capitalize text-blue-500 font-bold text-2xl">
            Create Your Team
          </h1>

          {message.text && (
            <p
              className={`mt-2 text-sm font-medium ${
                message.type === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {message.text}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-[2fr_300px] mx-auto gap-4 min-h-[400px]">
            <form onSubmit={handleCreateTeam} className="space-y-2 h-full">
              <div className="flex flex-col space-y-1">
                <label htmlFor="teamName" className="font-bold">
                  Team Name
                </label>
                <input
                  type="text"
                  name="teamName"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name..."
                  className="border rounded-md focus:outline-blue-500 py-1 p-2"
                  required
                />
              </div>
              <div className="flex flex-col space-y-1">
                <label htmlFor="teamDescription" className="font-bold">
                  Team Description
                </label>
                <textarea
                  name="teamDescription"
                  id="teamDescription"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Briefly describe your team's purpose..."
                  className="border rounded-md focus:outline-blue-500 py-1 min-h-[200px] p-2"
                />
              </div>
              <div className="flex flex-col space-y-1 ">
                <label htmlFor="memberEmail" className="font-bold">
                  Invite Team Member
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    name="memberEmail"
                    id="memberEmail"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    placeholder="Add a member by email.."
                    className="border rounded-md focus:outline-blue-500 py-1 w-full self-start p-2"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="bg-green-200 hover:bg-green-300 transition-colors rounded-md px-3 py-1"
                  >
                    Add
                  </button>
                </div>

                {invitedEmails.length > 0 && (
                  <ul className="flex flex-wrap gap-2 mt-1">
                    {invitedEmails.map((email) => (
                      <li
                        key={email}
                        className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                      >
                        {email}
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(email)}
                          className="font-bold hover:text-red-500"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Submit is placed in the right column below, this hidden
                  button lets Enter-to-submit still work from any field */}
              <button type="submit" className="hidden" aria-hidden="true" />
            </form>
            {/* col-2 */}
            <div className="flex flex-col gap-2">
              <img
                src={teamImage}
                alt=""
                className="h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={handleCreateTeam}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center bg-emerald-300 hover:bg-emerald-400 transition-colors py-1 rounded-md disabled:opacity-60"
              >
                {isSubmitting ? "Creating..." : "Create Team"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateTeam;
