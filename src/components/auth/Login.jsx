import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      await api.post("/login", formData);
      setMessage({ text: "Login successful", type: "success" });

      // Let App.jsx refresh loginUser (via /me) instead of relying on a
      // full page reload, then redirect once state is up to date.
      if (onLoginSuccess) {
        await onLoginSuccess();
      }
      setTimeout(() => navigate("/dashboard"), 400);
    } catch (err) {
      console.error(err);

      if (err.response) {
        setMessage({
          text: err.response.data?.message || "Login failed",
          type: "error",
        });
      } else {
        setMessage({ text: "Network error. Please try again.", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full min-h-[350px] max-w-md bg-white rounded-xl shadow-md p-8 mx-auto ">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Log in
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-700"
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-emerald-600 text-white py-2 rounded-md font-medium hover:bg-emerald-700 disabled:bg-green-500 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {message.text && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
          >
            {message.text}
          </p>
        )}

        <p className="mt-4 text-center text-sm text-gray-500">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-emerald-600 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
