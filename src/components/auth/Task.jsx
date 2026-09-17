// import React, { useEffect, useState, useRef } from "react";
// import api from "../services/api";
// import {
//   FaTrash,
//   FaPlus,
//   FaListUl,
//   FaCheckCircle,
//   FaClock,
// } from "react-icons/fa";
// import AddTask from "../services/AddTask";
// import { useOutletContext } from "react-router-dom";

// export default function Task() {
//   const loginUser = useOutletContext();
//   const [activeTab, setActiveTab] = useState("Tasks");
//   const [taskList, setTaskList] = useState([]);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   // Timer reference to prevent memory leaks on unmounted state updates
//   const timerRef = useRef(null);

//   const showNotification = (type, text) => {
//     if (timerRef.current) clearTimeout(timerRef.current);
//     setMessage({ type, text });
//     timerRef.current = setTimeout(() => {
//       setMessage({ type: "", text: "" });
//     }, 2500);
//   };

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearTimeout(timerRef.current);
//     };
//   }, []);

//   const getUserId = () => loginUser?._id || loginUser?.user || loginUser?.id;

//   const getTask = async () => {
//     const userId = getUserId();
//     if (!userId) return;

//     try {
//       const res = await api.get(`/getTaskList/${userId}`);
//       if (res.data) {
//         if (Array.isArray(res.data)) {
//           setTaskList(res.data);
//         } else if (Array.isArray(res.data.userTasks)) {
//           setTaskList(res.data.userTasks);
//         }
//       } else {
//         showNotification("error", res.data?.message || "Failed to fetch tasks");
//       }
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       showNotification("error", "Error connecting to server");
//     }
//   };

//   useEffect(() => {
//     if (loginUser) {
//       getTask();
//     }
//   }, [loginUser]);

//   // Handle Main Task Deletion
//   const handleDeleteTask = async (taskId) => {
//     const userId = getUserId();
//     if (!userId || !taskId) return;

//     if (!window.confirm("Are you sure you want to delete this task?")) return;

//     const previousTasks = [...taskList];
//     setTaskList((prev) => prev.filter((t) => t._id !== taskId));

//     try {
//       await api.delete(`/deleteTask/${userId}/${taskId}`);
//       showNotification("success", "Task deleted successfully");
//     } catch (error) {
//       console.error("Error deleting task:", error);
//       showNotification("error", "Failed to delete task");
//       setTaskList(previousTasks);
//     }
//   };

//   // Handle Subtask Deletion
//   const handleDeleteSubtask = async (taskId, subtaskIndex) => {
//     const userId = getUserId();
//     if (!userId || !taskId) return;

//     const previousTasks = [...taskList];

//     setTaskList((prevTasks) =>
//       prevTasks.map((t) => {
//         if (t._id === taskId) {
//           const updatedSubtasks = (t.subTask || []).filter(
//             (_, idx) => idx !== subtaskIndex,
//           );
//           const completedCount = updatedSubtasks.filter(
//             (st) => st.completed || st.isCompleted,
//           ).length;

//           const newProgress =
//             updatedSubtasks.length > 0
//               ? Math.round((completedCount / updatedSubtasks.length) * 100)
//               : 0;

//           return {
//             ...t,
//             subTask: updatedSubtasks,
//             progress: newProgress,
//             status:
//               newProgress === 100 && updatedSubtasks.length > 0
//                 ? "completed"
//                 : "pending",
//           };
//         }
//         return t;
//       }),
//     );

//     try {
//       const res = await api.delete(
//         `/deleteSubtask/${userId}/${taskId}/${subtaskIndex}`,
//       );
//       if (res.data?.task) {
//         setTaskList((prevTasks) =>
//           prevTasks.map((t) => (t._id === taskId ? res.data.task : t)),
//         );
//       }
//       showNotification("success", "Subtask deleted successfully");
//     } catch (error) {
//       console.error("Error deleting subtask:", error);
//       showNotification("error", "Failed to delete subtask");
//       setTaskList(previousTasks);
//     }
//   };

//   // Handle Subtask Status Toggle
//   const handleSubtaskToggle = async (userId, taskId, subtaskIndex) => {
//     setTaskList((prevTasks) =>
//       prevTasks.map((t) => {
//         if (t._id === taskId) {
//           const updatedSubtasks = (t.subTask || []).map((st, idx) => {
//             if (idx === subtaskIndex) {
//               const currentStatus = st.completed || st.isCompleted || false;
//               return {
//                 ...st,
//                 completed: !currentStatus,
//                 isCompleted: !currentStatus,
//               };
//             }
//             return st;
//           });

//           const completedCount = updatedSubtasks.filter(
//             (st) => st.completed || st.isCompleted,
//           ).length;
//           const newProgress =
//             updatedSubtasks.length > 0
//               ? Math.round((completedCount / updatedSubtasks.length) * 100)
//               : 0;

//           return {
//             ...t,
//             subTask: updatedSubtasks,
//             progress: newProgress,
//             status: newProgress === 100 ? "completed" : "pending",
//           };
//         }
//         return t;
//       }),
//     );

//     try {
//       await api.post(`/updateTaskStatus/${userId}/${subtaskIndex}`, { taskId });
//       getTask();
//     } catch (error) {
//       console.error("Error updating subtask status:", error);
//       getTask();
//     }
//   };

//   // Handle Main Task Status Toggle
//   const handleMainTaskToggle = async (userId, taskId) => {
//     try {
//       await api.post(`/updateTaskStatus/${userId}/0`, { taskId });
//       getTask();
//     } catch (error) {
//       console.error("Error updating main task status:", error);
//     }
//   };

//   return (
//     <div className="w-full h-full flex flex-col gap-5">
//       {/* Top Controls Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
//         {/* Navigation Tabs */}
//         <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
//           <button
//             onClick={() => setActiveTab("Tasks")}
//             className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
//               activeTab === "Tasks"
//                 ? "bg-white text-emerald-600 shadow-sm"
//                 : "text-slate-600 hover:text-slate-900"
//             }`}
//           >
//             <FaListUl />
//             <span>All Tasks ({taskList.length})</span>
//           </button>
//           <button
//             onClick={() => setActiveTab("Add Task")}
//             className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
//               activeTab === "Add Task"
//                 ? "bg-white text-emerald-600 shadow-sm"
//                 : "text-slate-600 hover:text-slate-900"
//             }`}
//           >
//             <FaPlus />
//             <span>Add New Task</span>
//           </button>
//         </div>

//         {/* Floating Notification */}
//         {message.text && (
//           <div
//             className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
//               message.type === "error"
//                 ? "bg-rose-50 text-rose-700 border-rose-200"
//                 : "bg-emerald-50 text-emerald-700 border-emerald-200"
//             }`}
//           >
//             {message.text}
//           </div>
//         )}
//       </div>

//       {/* Main View Area */}
//       {activeTab === "Tasks" && (
//         <div className="flex flex-col gap-4 overflow-y-auto pr-1">
//           {taskList.length === 0 ? (
//             <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
//               <FaListUl className="w-10 h-10 text-slate-300 mb-3" />
//               <p className="text-sm font-medium text-slate-600">
//                 No tasks created yet.
//               </p>
//               <button
//                 onClick={() => setActiveTab("Add Task")}
//                 className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
//               >
//                 + Add your first task
//               </button>
//             </div>
//           ) : (
//             taskList.map((task, taskIndex) => {
//               const hasSubtasks = task.subTask && task.subTask.length > 0;
//               const isCompleted = task.status?.toLowerCase() === "completed";

//               return (
//                 <div
//                   key={task._id || `task-${taskIndex}`}
//                   className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-5 justify-between items-start"
//                 >
//                   {/* Left Column: Details & Subtasks */}
//                   <div className="flex-1 w-full flex flex-col gap-3">
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="flex items-center gap-3">
//                         {!hasSubtasks && (
//                           <input
//                             type="checkbox"
//                             checked={isCompleted}
//                             className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0"
//                             onChange={() =>
//                               handleMainTaskToggle(getUserId(), task._id)
//                             }
//                           />
//                         )}
//                         <h2
//                           className={`text-base sm:text-lg font-bold text-slate-800 ${
//                             isCompleted ? "line-through text-slate-400" : ""
//                           }`}
//                         >
//                           {task.title}
//                         </h2>
//                       </div>

//                       <button
//                         type="button"
//                         onClick={() => handleDeleteTask(task._id)}
//                         className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
//                         title="Delete Task"
//                       >
//                         <FaTrash size={14} />
//                       </button>
//                     </div>

//                     {/* Subtasks Section */}
//                     {hasSubtasks ? (
//                       <ul className="space-y-2 mt-1">
//                         {task.subTask.map((subTaskItem, subIndex) => {
//                           const subtaskText =
//                             typeof subTaskItem === "string"
//                               ? subTaskItem
//                               : subTaskItem?.title ||
//                                 subTaskItem?.text ||
//                                 subTaskItem?.name ||
//                                 subTaskItem?.task ||
//                                 subTaskItem?.subtask ||
//                                 subTaskItem?.value ||
//                                 `Subtask ${subIndex + 1}`;

//                           const isSubtaskDone =
//                             subTaskItem?.completed ||
//                             subTaskItem?.isCompleted ||
//                             false;

//                           return (
//                             <li
//                               key={
//                                 subTaskItem._id ||
//                                 `sub-${task._id || taskIndex}-${subIndex}`
//                               }
//                               className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
//                             >
//                               <div className="flex items-center gap-3 min-w-0">
//                                 <input
//                                   type="checkbox"
//                                   checked={Boolean(isSubtaskDone)}
//                                   className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
//                                   onChange={() =>
//                                     handleSubtaskToggle(
//                                       getUserId(),
//                                       task._id,
//                                       subIndex,
//                                     )
//                                   }
//                                 />
//                                 <span
//                                   className={`text-xs sm:text-sm font-medium truncate ${
//                                     isSubtaskDone
//                                       ? "line-through text-slate-400"
//                                       : "text-slate-700"
//                                   }`}
//                                 >
//                                   {subtaskText}
//                                 </span>
//                               </div>

//                               <button
//                                 type="button"
//                                 onClick={() =>
//                                   handleDeleteSubtask(task._id, subIndex)
//                                 }
//                                 className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors shrink-0"
//                                 title="Delete Subtask"
//                               >
//                                 <FaTrash size={12} />
//                               </button>
//                             </li>
//                           );
//                         })}
//                       </ul>
//                     ) : (
//                       <div className="mt-1 flex items-center gap-2">
//                         <button
//                           type="button"
//                           onClick={() =>
//                             handleMainTaskToggle(getUserId(), task._id)
//                           }
//                           className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
//                             isCompleted
//                               ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
//                               : "bg-slate-100 hover:bg-slate-200 text-slate-700"
//                           }`}
//                         >
//                           {isCompleted ? (
//                             <>
//                               <FaCheckCircle /> Completed
//                             </>
//                           ) : (
//                             <>
//                               <FaClock /> Mark Complete
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     )}
//                   </div>

//                   {/* Right Column: Progress Indicator & Status Badge */}
//                   <div className="w-full lg:w-48 flex lg:flex-col justify-between items-center lg:items-stretch gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-5 shrink-0">
//                     <div className="flex flex-col gap-1.5 w-full">
//                       <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
//                         <span>Progress</span>
//                         <span>{task.progress || 0}%</span>
//                       </div>
//                       <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
//                         <div
//                           style={{ width: `${task.progress || 0}%` }}
//                           className="h-full bg-emerald-500 rounded-full transition-all duration-300"
//                         />
//                       </div>
//                     </div>

//                     <div className="self-end lg:self-start">
//                       <span
//                         className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
//                           isCompleted
//                             ? "bg-emerald-100 text-emerald-800"
//                             : "bg-amber-100 text-amber-800"
//                         }`}
//                       >
//                         {task.status || "Pending"}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       )}

//       {/* Add Task Sub-Component View */}
//       {activeTab === "Add Task" && (
//         <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm">
//           <AddTask
//             loginUser={loginUser}
//             onTaskAdded={() => {
//               getTask();
//               setActiveTab("Tasks");
//             }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import {
  FaTrash,
  FaPlus,
  FaListUl,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";
import AddTask from "../services/AddTask";
import { useOutletContext } from "react-router-dom";

export default function Task() {
  // 1. Unwrap context cleanly
  const contextData = useOutletContext() || {};
  const loginUser = contextData.loginUser || contextData;
  const openAddTaskModal = contextData.openAddTask;

  const [activeTab, setActiveTab] = useState("Tasks");
  const [taskList, setTaskList] = useState([]);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Fallback state for inline task creation if AddTask component fails/returns empty
  const [inlineTitle, setInlineTitle] = useState("");
  const [isSubmittingInline, setIsSubmittingInline] = useState(false);

  const timerRef = useRef(null);

  const showNotification = (type, text) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage({ type, text });
    timerRef.current = setTimeout(() => {
      setMessage({ type: "", text: "" });
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Safely resolve User ID
  const getUserId = () =>
    loginUser?._id ||
    loginUser?.id ||
    loginUser?.user?._id ||
    loginUser?.user?.id ||
    (typeof loginUser === "string" ? loginUser : null);

  const getTask = async () => {
    const userId = getUserId();

    console.log("--> Current Context Data:", contextData);
    console.log("--> Resolved loginUser:", loginUser);
    console.log("--> Extracted userId:", userId);

    if (!userId) {
      console.warn("--> getTask aborted: No valid userId found.");
      return;
    }

    try {
      const res = await api.get(`/getTaskList/${userId}`);
      console.log("--> API Raw Response:", res);

      if (res.data) {
        let fetchedTasks = null;

        if (Array.isArray(res.data)) {
          fetchedTasks = res.data;
        } else if (Array.isArray(res.data.userTasks)) {
          fetchedTasks = res.data.userTasks;
        } else if (Array.isArray(res.data.tasks)) {
          fetchedTasks = res.data.tasks;
        } else if (Array.isArray(res.data.data)) {
          fetchedTasks = res.data.data;
        } else if (res.data.task && Array.isArray(res.data.task)) {
          fetchedTasks = res.data.task;
        }

        if (fetchedTasks) {
          console.log("--> Successfully extracted task array:", fetchedTasks);
          setTaskList(fetchedTasks);
        } else {
          console.warn("--> Array not found in res.data:", res.data);
          setTaskList([]);
        }
      } else {
        showNotification("error", res.data?.message || "Failed to fetch tasks");
      }
    } catch (error) {
      console.error("--> Error fetching tasks from server:", error);
      showNotification("error", "Error connecting to server");
    }
  };

  useEffect(() => {
    if (loginUser) {
      getTask();
    }
  }, [loginUser, contextData?.refreshTrigger]);

  // Handle Tab Switch / Trigger Modal
  const handleAddTaskClick = () => {
    if (typeof openAddTaskModal === "function") {
      openAddTaskModal();
    }
    setActiveTab("Add Task");
  };

  // Fallback task creation handler if AddTask component fails
  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    const userId = getUserId();
    if (!inlineTitle.trim() || !userId) return;

    setIsSubmittingInline(true);
    try {
      await api.post(`/addTask/${userId}`, { title: inlineTitle.trim() });
      setInlineTitle("");
      getTask();
      setActiveTab("Tasks");
      showNotification("success", "Task created successfully!");
    } catch (err) {
      console.error("Inline task creation error:", err);
      showNotification("error", "Failed to add task");
    } finally {
      setIsSubmittingInline(false);
    }
  };

  // Delete Main Task
  const handleDeleteTask = async (taskId) => {
    const userId = getUserId();
    if (!userId || !taskId) return;

    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const previousTasks = [...taskList];
    setTaskList((prev) => prev.filter((t) => t._id !== taskId));

    try {
      await api.delete(`/deleteTask/${userId}/${taskId}`);
      showNotification("success", "Task deleted successfully");
    } catch (error) {
      console.error("Error deleting task:", error);
      showNotification("error", "Failed to delete task");
      setTaskList(previousTasks);
    }
  };

  // Delete Subtask
  const handleDeleteSubtask = async (taskId, subtaskIndex) => {
    const userId = getUserId();
    if (!userId || !taskId) return;

    const previousTasks = [...taskList];

    setTaskList((prevTasks) =>
      prevTasks.map((t) => {
        if (t._id === taskId) {
          const updatedSubtasks = (t.subTask || []).filter(
            (_, idx) => idx !== subtaskIndex,
          );
          const completedCount = updatedSubtasks.filter(
            (st) => st.completed || st.isCompleted,
          ).length;

          const newProgress =
            updatedSubtasks.length > 0
              ? Math.round((completedCount / updatedSubtasks.length) * 100)
              : 0;

          return {
            ...t,
            subTask: updatedSubtasks,
            progress: newProgress,
            status:
              newProgress === 100 && updatedSubtasks.length > 0
                ? "completed"
                : "pending",
          };
        }
        return t;
      }),
    );

    try {
      const res = await api.delete(
        `/deleteSubtask/${userId}/${taskId}/${subtaskIndex}`,
      );
      if (res.data?.task) {
        setTaskList((prevTasks) =>
          prevTasks.map((t) => (t._id === taskId ? res.data.task : t)),
        );
      }
      showNotification("success", "Subtask deleted successfully");
    } catch (error) {
      console.error("Error deleting subtask:", error);
      showNotification("error", "Failed to delete subtask");
      setTaskList(previousTasks);
    }
  };

  // Toggle Subtask Status
  const handleSubtaskToggle = async (userId, taskId, subtaskIndex) => {
    setTaskList((prevTasks) =>
      prevTasks.map((t) => {
        if (t._id === taskId) {
          const updatedSubtasks = (t.subTask || []).map((st, idx) => {
            if (idx === subtaskIndex) {
              const currentStatus = st.completed || st.isCompleted || false;
              return {
                ...st,
                completed: !currentStatus,
                isCompleted: !currentStatus,
              };
            }
            return st;
          });

          const completedCount = updatedSubtasks.filter(
            (st) => st.completed || st.isCompleted,
          ).length;
          const newProgress =
            updatedSubtasks.length > 0
              ? Math.round((completedCount / updatedSubtasks.length) * 100)
              : 0;

          return {
            ...t,
            subTask: updatedSubtasks,
            progress: newProgress,
            status: newProgress === 100 ? "completed" : "pending",
          };
        }
        return t;
      }),
    );

    try {
      await api.post(`/updateTaskStatus/${userId}/${subtaskIndex}`, { taskId });
      getTask();
    } catch (error) {
      console.error("Error updating subtask status:", error);
      getTask();
    }
  };

  // Toggle Main Task Status
  const handleMainTaskToggle = async (userId, taskId) => {
    try {
      await api.post(`/updateTaskStatus/${userId}/0`, { taskId });
      getTask();
    } catch (error) {
      console.error("Error updating main task status:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-5">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("Tasks")}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "Tasks"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaListUl />
            <span>
              All Tasks ({Array.isArray(taskList) ? taskList.length : 0})
            </span>
          </button>
          <button
            type="button"
            onClick={handleAddTaskClick}
            className={`flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === "Add Task"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FaPlus />
            <span>Add New Task</span>
          </button>
        </div>

        {message.text && (
          <div
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              message.type === "error"
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-50 text-emerald-700 border-emerald-200"
            }`}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Task List View */}
      {activeTab === "Tasks" && (
        <div className="flex flex-col gap-4 overflow-y-auto pr-1">
          {!Array.isArray(taskList) || taskList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
              <FaListUl className="w-10 h-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-600">
                No tasks created yet.
              </p>
              <button
                type="button"
                onClick={handleAddTaskClick}
                className="mt-3 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
              >
                + Add your first task
              </button>
            </div>
          ) : (
            taskList.map((task, taskIndex) => {
              const hasSubtasks =
                Array.isArray(task.subTask) && task.subTask.length > 0;
              const isCompleted = task.status?.toLowerCase() === "completed";

              return (
                <div
                  key={task._id || `task-${taskIndex}`}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row gap-5 justify-between items-start"
                >
                  <div className="flex-1 w-full flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {!hasSubtasks && (
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            className="w-5 h-5 accent-emerald-600 rounded cursor-pointer shrink-0"
                            onChange={() =>
                              handleMainTaskToggle(getUserId(), task._id)
                            }
                          />
                        )}
                        <h2
                          className={`text-base sm:text-lg font-bold text-slate-800 ${
                            isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {task.title || task.name || "Untitled Task"}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                        title="Delete Task"
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>

                    {hasSubtasks ? (
                      <ul className="space-y-2 mt-1">
                        {task.subTask.map((subTaskItem, subIndex) => {
                          const subtaskText =
                            typeof subTaskItem === "string"
                              ? subTaskItem
                              : subTaskItem?.title ||
                                subTaskItem?.text ||
                                subTaskItem?.name ||
                                subTaskItem?.task ||
                                subTaskItem?.subtask ||
                                subTaskItem?.value ||
                                `Subtask ${subIndex + 1}`;

                          const isSubtaskDone =
                            subTaskItem?.completed ||
                            subTaskItem?.isCompleted ||
                            false;

                          return (
                            <li
                              key={
                                subTaskItem._id ||
                                `sub-${task._id || taskIndex}-${subIndex}`
                              }
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100/80 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={Boolean(isSubtaskDone)}
                                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer shrink-0"
                                  onChange={() =>
                                    handleSubtaskToggle(
                                      getUserId(),
                                      task._id,
                                      subIndex,
                                    )
                                  }
                                />
                                <span
                                  className={`text-xs sm:text-sm font-medium truncate ${
                                    isSubtaskDone
                                      ? "line-through text-slate-400"
                                      : "text-slate-700"
                                  }`}
                                >
                                  {subtaskText}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteSubtask(task._id, subIndex)
                                }
                                className="text-slate-400 hover:text-rose-500 p-1.5 transition-colors shrink-0 cursor-pointer"
                                title="Delete Subtask"
                              >
                                <FaTrash size={12} />
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handleMainTaskToggle(getUserId(), task._id)
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <FaCheckCircle /> Completed
                            </>
                          ) : (
                            <>
                              <FaClock /> Mark Complete
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full lg:w-48 flex lg:flex-col justify-between items-center lg:items-stretch gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-5 shrink-0">
                    <div className="flex flex-col gap-1.5 w-full">
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-600">
                        <span>Progress</span>
                        <span>{task.progress || 0}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${task.progress || 0}%` }}
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="self-end lg:self-start">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold capitalize ${
                          isCompleted
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {task.status || "Pending"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Task View with Safety Fallback */}
      {activeTab === "Add Task" && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Create New Task
          </h3>

          {/* Primary External Component */}
          {AddTask ? (
            <AddTask
              loginUser={loginUser}
              onTaskAdded={() => {
                getTask();
                setActiveTab("Tasks");
                showNotification("success", "Task created successfully!");
              }}
              onCancel={() => setActiveTab("Tasks")}
            />
          ) : null}

          {/* Fallback Form in case AddTask component is missing or fails */}
          <form
            onSubmit={handleInlineSubmit}
            className="flex flex-col sm:flex-row gap-3 pt-2"
          >
            <input
              type="text"
              placeholder="Enter task title..."
              value={inlineTitle}
              onChange={(e) => setInlineTitle(e.target.value)}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isSubmittingInline}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmittingInline ? "Saving..." : "Quick Add"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("Tasks")}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
