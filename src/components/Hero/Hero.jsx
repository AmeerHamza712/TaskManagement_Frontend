import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X, Plus, UserPlus } from "lucide-react";
import Sidebar from "./Sidebar";
import SearchBar from "./SearchBar";
import InviteTeamMember from "../services/InviteTeamMember";
import AddTaskModal from "../services/AddTask";

export function Hero({ loginUser }) {
  const [openInviteModal, setOpenInviteModal] = useState(false);
  const [openAddTaskModal, setOpenAddTaskModal] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState("Analytics");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/").pop();
    if (path && path !== "dashboard") {
      const formattedTitle = path
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      setActivePage(formattedTitle);
    } else {
      setActivePage("Analytics");
    }
    setMobileSidebarOpen(false);
  }, [location]);

  const handleTaskAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="h-screen w-screen bg-slate-100 flex overflow-hidden font-sans text-slate-800">
      {/* Modals */}
      {openInviteModal && (
        <InviteTeamMember onClose={() => setOpenInviteModal(false)} />
      )}

      {openAddTaskModal && (
        <AddTaskModal
          isOpen={openAddTaskModal}
          onClose={() => setOpenAddTaskModal(false)}
          loginUser={loginUser}
          onTaskAdded={handleTaskAdded}
        />
      )}

      {/* Mobile Drawer Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden  transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile Slide-Out Sidebar Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-slate-200 shrink-0">
          <span className="font-bold text-slate-800 text-lg">Dashboard</span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1.5 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            activePage={activePage}
            setActivePage={setActivePage}
            isOpen={mobileSidebarOpen}
            setIsOpen={setMobileSidebarOpen}
            loginUser={loginUser}
          />
        </div>
      </div>

      {/* Desktop Permanent Sidebar */}
      <aside className="hidden md:flex flex-col w-60 lg:w-64 bg-white border-r border-slate-200 shrink-0 h-full">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          loginUser={loginUser}
        />
      </aside>

      {/* Main Content Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <SearchBar loginUser={loginUser} />
          </div>
        </header>

        {/* Dynamic Workspace */}
        <main className="flex-1 p-3 sm:p-5 overflow-hidden flex flex-col gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Action Bar Header */}
            <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 flex flex-row items-center justify-between gap-4 shrink-0">
              <div className="min-w-0 flex-1">
                <h1 className="font-extrabold text-xl sm:text-2xl text-slate-900 tracking-tight truncate">
                  {activePage}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 truncate hidden sm:block">
                  Welcome back! Here is what's happening today.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setOpenInviteModal(true)}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl transition-all duration-200 cursor-pointer border border-slate-200"
                >
                  <UserPlus className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Invite Member</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenAddTaskModal(true)}
                  className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] rounded-xl shadow-sm shadow-emerald-600/20 transition-all duration-200 shrink-0 cursor-pointer border border-emerald-600"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span className="whitespace-nowrap">Add Task</span>
                </button>
              </div>
            </div>

            {/* Outlet Container */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto min-h-0">
              <Outlet
                context={{
                  loginUser,
                  refreshTrigger,
                  openAddTask: () => setOpenAddTaskModal(true),
                  openInviteModal: () => setOpenInviteModal(true),
                }}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Hero;
