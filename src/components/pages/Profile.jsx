import React, { useState, useEffect } from "react";
import api from "../services/api";

export default function Profile({ activeTab, loginUser }) {
  const [message, setMessage] = useState({ type: "", text: "" });
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Pre-fill the form once loginUser is available instead of always
  // starting blank (which meant every save wiped out existing profile data).
  useEffect(() => {
    if (loginUser) {
      setFormData({
        name: loginUser.name || "",
        email: loginUser.email || "",
      });
    }
  }, [loginUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    const userId = loginUser?._id || loginUser?.user || loginUser?.id;
    if (!userId) {
      setMessage({ type: "error", text: "Could not identify the logged-in user." });
      return;
    }

    setSaving(true);
    try {
      const res = await api.post(`/profile-update/${userId}`, formData);
      setMessage({
        type: "success",
        text: res.data?.message || "Profile updated successfully",
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Error while updating profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {activeTab === "profile" && (
        <div className="relative">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="john@example.com"
              />
            </div>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Details"}
            </button>
          </div>
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
      )}
    </>
  );
}
