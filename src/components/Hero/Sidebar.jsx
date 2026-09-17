import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MdAnalytics,
  MdCalendarMonth,
  MdDashboard,
  MdLogout,
  MdSettings,
  MdTask,
  MdClose,
} from "react-icons/md";
import { FaTeamspeak } from "react-icons/fa";
import api from "../services/api";

export default function Sidebar({
  activePage,
  setActivePage,
  isOpen,
  setIsOpen,
}) {
  const location = useLocation();
  const navigate = useNavigate();

  const mainMenus = [
    { title: "Tasks", icon: <MdTask />, isTab: true, path: "/dashboard/tasks" },
    {
      title: "Calendar",
      icon: <MdCalendarMonth />,
      isTab: true,
      path: "/dashboard/calendar",
    },
    {
      title: "Analytics",
      icon: <MdAnalytics />,
      isTab: true,
      path: "/dashboard/analytics",
    },
    {
      title: "Team",
      icon: <FaTeamspeak />,
      isTab: true,
      path: "/dashboard/team",
    },
  ];

  const generalMenu = [
    {
      title: "Setting",
      icon: <MdSettings />,
      isTab: true,
      path: "/dashboard/settings",
    },
    { title: "Logout", icon: <MdLogout />, isLogout: true },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      window.location.href = "/login";
    }
  };

  const handleItemClick = (menu) => {
    if (menu.isLogout) {
      handleLogout();
      return;
    }
    if (menu.isTab && setActivePage) {
      setActivePage(menu.title);
    }
    if (menu.path) {
      navigate(menu.path);
    }
    // Close sidebar overlay on mobile after clicking a link
    if (setIsOpen) {
      setIsOpen(false);
    }
  };

  const renderMenuItem = (menu) => {
    const isActive =
      activePage === menu.title || location.pathname === menu.path;

    if (menu.isLogout) {
      return (
        <li
          key={menu.title}
          onClick={() => handleItemClick(menu)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white cursor-pointer transition-all duration-200 font-medium group text-sm"
        >
          <span className="text-xl transition-transform duration-200 group-hover:scale-110">
            {menu.icon}
          </span>
          <span className="w-full">{menu.title}</span>
        </li>
      );
    }

    return (
      <li
        key={menu.title}
        onClick={() => handleItemClick(menu)}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium group ${
          isActive
            ? "bg-green-500 text-white shadow-md shadow-green-500/20"
            : "text-gray-600 hover:bg-emerald-50 hover:text-green-600"
        }`}
      >
        <span
          className={`text-xl transition-transform duration-200 group-hover:scale-110 ${
            isActive
              ? "text-white"
              : "text-green-500 group-hover:text-green-600"
          }`}
        >
          {menu.icon}
        </span>
        <span className="w-full">{menu.title}</span>
      </li>
    );
  };

  return (
    <>
      {/* Mobile Backdrop / Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen && setIsOpen(false)}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 sm:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed sm:static top-0 left-0 z-50 h-full w-64 bg-slate-50 border-r border-slate-200 p-5 shadow-sm select-none flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-xl text-white shadow-md shadow-green-500/20">
              <MdDashboard className="text-2xl" />
            </div>
            <span className="font-bold text-xl text-slate-800 tracking-tight">
              Dashboard
            </span>
          </div>

          {/* Close button visible only on mobile */}
          <button
            type="button"
            onClick={() => setIsOpen && setIsOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg sm:hidden cursor-pointer"
          >
            <MdClose size={22} />
          </button>
        </div>

        {/* Navigation Content Area */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Main Menu */}
          <div className="space-y-1.5">
            <h2 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu
            </h2>
            <ul className="space-y-1">
              {mainMenus.map((menu) => renderMenuItem(menu))}
            </ul>
          </div>

          {/* General Menu */}
          <div className="space-y-1.5">
            <h2 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              General
            </h2>
            <ul className="space-y-1">
              {generalMenu.map((menu) => renderMenuItem(menu))}
            </ul>
          </div>
        </div>

        {/* App Banner - Hidden on mobile, visible on sm screens and up */}
        <div className="hidden sm:block p-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mt-auto text-white shadow-lg shadow-green-500/20 shrink-0">
          <span className="font-semibold text-sm block">
            Download Mobile App
          </span>
          <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
            Access your tasks and analytics anywhere on the go.
          </p>
          <button className="mt-4 py-2 px-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white text-xs font-medium rounded-xl w-full transition-all duration-200 cursor-pointer">
            Download
          </button>
        </div>
      </aside>
    </>
  );
}
