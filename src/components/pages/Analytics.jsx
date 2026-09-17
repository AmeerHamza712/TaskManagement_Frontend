import React, { useState, useEffect } from "react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { FiTrendingUp, FiPieChart } from "react-icons/fi";
import api from "../services/api";

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export default function Analytics() {
  const [teamProgress, setTeamProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  console.log("Analytic Page:", teamProgress);
  const getProgress = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get(`/teams/getProg`);
      setTeamProgress(res.data?.progress?.[0]?.pooraDoc || []);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProgress();
  }, []);
  console.log("Analytic Page", teamProgress);

  // Soft modern color palette
  const chartColors = [
    "#10b981", // Emerald
    "#3b82f6", // Blue
    "#f59e0b", // Amber
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#06b6d4", // Cyan
    "#f97316", // Orange
  ];

  const chartData = {
    labels: teamProgress.map((p) => p.name || "Task"),
    datasets: [
      {
        label: "Progress (%)",
        data: teamProgress.map((p) => p.progress || 0),
        backgroundColor: chartColors.slice(0, teamProgress.length),
        borderRadius: 8,
        borderSkipped: false,
        barThickness: 32,
        maxBarThickness: 48,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1e293b",
        titleFont: { size: 12, weight: "bold" },
        bodyFont: { size: 12 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: (context) => `Progress: ${context.parsed.y}%`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "#64748b", font: { size: 11, weight: "500" } },
        grid: { display: false },
        border: { display: false },
      },
      y: {
        min: 0,
        max: 100,
        ticks: {
          color: "#94a3b8",
          font: { size: 10 },
          stepSize: 25,
          callback: (value) => `${value}%`,
        },
        grid: { color: "#f1f5f9" },
        border: { dash: [4, 4], display: false },
      },
    },
  };

  const doughnutData = {
    labels: teamProgress.map((p) => p.name || "Task"),
    datasets: [
      {
        data: teamProgress.map((p) => p.progress || 0),
        backgroundColor: chartColors.slice(0, teamProgress.length),
        borderWidth: 2,
        borderColor: "#ffffff",
        hoverOffset: 6,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#475569",
          font: { size: 11, weight: "500" },
          boxWidth: 10,
          boxHeight: 10,
          usePointStyle: true,
          padding: 14,
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => ` ${context.label}: ${context.parsed}%`,
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[320px]">
      {/* Progress Bar Chart Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FiTrendingUp className="text-base" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-sm">
                Project Overview
              </h2>
              <p className="text-slate-400 text-[11px]">
                Overall completion tracking
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
            Active
          </span>
        </div>

        <div className="flex-1 w-full min-h-[200px] relative">
          {loading ? (
            <div className="w-full h-full animate-pulse bg-slate-100 rounded-xl" />
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-rose-400 text-xs">
              Couldn't load analytics. Try refreshing.
            </div>
          ) : teamProgress.length > 0 ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No progress data available
            </div>
          )}
        </div>
      </div>

      {/* Progress Doughnut Chart Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FiPieChart className="text-base" />
            </div>
            <div>
              <h2 className="text-slate-800 font-bold text-sm">Distribution</h2>
              <p className="text-slate-400 text-[11px]">
                Individual contribution breakdown
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full min-h-[200px] flex items-center justify-center relative">
          {loading ? (
            <div className="w-40 h-40 animate-pulse bg-slate-100 rounded-full" />
          ) : error ? (
            <div className="w-full h-full flex items-center justify-center text-rose-400 text-xs">
              Couldn't load analytics. Try refreshing.
            </div>
          ) : teamProgress.length > 0 ? (
            <Doughnut data={doughnutData} options={doughnutOptions} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
              No distribution data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
