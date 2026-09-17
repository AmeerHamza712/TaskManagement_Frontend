import { useState } from "react";
import api from "../../services/api";
import Navbar from "../../Hero/Navbar";

// NOTE: Sidebar.jsx already has a working one-click logout button, so this
// standalone page is only needed if you want a confirmation screen reachable
// at its own route. It wasn't wired into App.jsx's routes; add
// `<Route path="/logout" element={<LogOut />} />` there if you want to use it.
function LogOut() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      await api.post("/logout");
      setMessage({ text: "Logged out successfully", type: "success" });

      // Full reload clears any in-memory auth state and lands on /login.
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
    } catch (err) {
      console.error(err);
      if (err.response) {
        setMessage({
          text: err.response.data?.message || "Logout failed",
          type: "error",
        });
      } else {
        setMessage({ text: "Network error. Please try again.", type: "error" });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div>
        <Navbar />
      </div>
      <div className="w-full min-h-[350px] max-w-md bg-white rounded-xl shadow-md p-8 mx-auto ">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Log Out
        </h2>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium hover:bg-emerald-700 disabled:bg-green-500 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Logging out..." : "Log Out"}
        </button>

        {message.text && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}
      </div>
    </div>
  );
}

export default LogOut;
