import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "./components/services/api";

import { Hero } from "./components/Hero/Hero";
import Login from "./components/auth/Login";
import SignUp from "./components/auth/SignUp";
import CreateTeam from "./components/pages/createTeam";
import Setting from "./components/pages/Setting";
import Team from "./components/pages/Team";
import Task from "./components/auth/Task";
import Calendar from "./components/pages/Calendar";
import Analytics from "./components/pages/Analytics";

export default function App() {
  const [loginUser, setLoginUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getMe = async () => {
    try {
      const response = await api.get("/me");
      const userData = response.data.user || response.data;
      setLoginUser(userData);
    } catch (err) {
      setLoginUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-slate-600">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen box-border">
      <Routes>
        {/* Fix 1: Dynamically redirect based on auth status */}
        <Route
          path="/"
          element={
            <Navigate
              to={loginUser ? "/dashboard/analytics" : "/login"}
              replace
            />
          }
        />

        {/* Protected dashboard routes */}
        <Route
          element={
            loginUser ? (
              <DashboardLayout loginUser={loginUser} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/dashboard" element={<Hero loginUser={loginUser} />}>
            <Route index element={<Navigate to="tasks" replace />} />
            <Route path="tasks" element={<Task />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="team" element={<Team />} />
            <Route path="settings" element={<Setting />} />
            <Route
              path="create-team"
              element={<CreateTeam loginUser={loginUser} />}
            />
          </Route>
        </Route>

        {/* Standalone /settings redirect */}
        <Route
          path="/settings"
          element={<Navigate to="/dashboard/settings" replace />}
        />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            loginUser ? (
              <Navigate to="/dashboard/analytics" replace />
            ) : (
              <Login onLoginSuccess={getMe} />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />

        {/* Unknown routes fall back to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

// Fix 2: Corrected 'contextt' to 'context'
function DashboardLayout({ loginUser }) {
  return <Outlet context={{ loginUser }} />;
}
