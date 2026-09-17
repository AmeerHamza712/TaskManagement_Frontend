import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    avatar: null,
    title: "",
    bio: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0] || null;
    setFormData({ ...formData, avatar: file });

    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("title", formData.title);
      data.append("bio", formData.bio);

      if (formData.avatar) {
        data.append("avatar", formData.avatar);
      }

      const res = await api.post("/addUser", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setMessage({
        text: res.data.message || "User added successfully!",
        type: "success",
      });

      setFormData({
        name: "",
        email: "",
        password: "",
        avatar: null,
        title: "",
        bio: "",
      });
      setAvatarPreview(null);

      // Send the new user to log in with their new credentials.
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || "Signup failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 sm:p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 transition-all">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
            Create an Account
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Join us today! Enter your details below.
          </p>
        </div>

        {/* Feedback Alert */}
        {message.text && (
          <div
            className={`mb-5 p-3.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-rose-50 text-rose-700 border border-rose-200"
            }`}
          >
            <span>{message.type === "success" ? "✓" : "✕"}</span>
            {message.text}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Avatar Upload with Live Preview */}
          <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 border border-slate-300">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg
                  className="w-7 h-7 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Profile Photo
              </label>
              <input
                id="avatar"
                type="file"
                name="avatar"
                accept="image/png, image/jpeg, image/jpg"
                onChange={handleAvatarChange}
                className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 file:cursor-pointer file:transition"
              />
            </div>
          </div>

          {/* Name & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              name="password"
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Job Title
            </label>
            <input
              id="title"
              type="text"
              placeholder="e.g. Senior Frontend Developer"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
          </div>

          {/* Bio */}
          <div>
            <label
              htmlFor="bio"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us a little bit about yourself..."
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-sm placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
              rows="3"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Creating Account...</span>
              </>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-medium hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
