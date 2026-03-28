"use client";

import { useState } from "react";
import {
  Thermometer,
  HeartPulse,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
} from "lucide-react";
import { healthLogs as initialLogs } from "@/lib/data";

const statusConfig = {
  normal: { color: "text-emerald-600", bg: "bg-emerald-50", label: "Normal" },
  warning: { color: "text-amber-600", bg: "bg-amber-50", label: "Elevated" },
  critical: { color: "text-red-600", bg: "bg-red-50", label: "Critical" },
};

const iconMap = {
  Temperature: Thermometer,
  "Blood Pressure": HeartPulse,
  "Heart Rate": Activity,
  "Blood Sugar": Droplets,
  SpO2: Droplets,
};

const metricOptions = [
  "Blood Pressure",
  "Temperature",
  "Heart Rate",
  "SpO2",
  "Blood Sugar",
];

export default function HealthLogsPage() {
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [logs, setLogs] = useState(initialLogs);
  const [formType, setFormType] = useState("Blood Pressure");
  const [formValue, setFormValue] = useState("");
  const [formNote, setFormNote] = useState("");

  const handleSave = () => {
    if (!formValue.trim()) return;
    const newLog = {
      date: "Just now",
      type: formType,
      value: formValue,
      status: "normal",
      note: formNote || undefined,
    };
    setLogs([newLog, ...logs]);
    setFormValue("");
    setFormNote("");
    setFormType("Blood Pressure");
    setIsAddingLog(false);
  };

  const handleCancel = () => {
    setFormValue("");
    setFormNote("");
    setFormType("Blood Pressure");
    setIsAddingLog(false);
  };

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Logs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Track your daily health metrics
          </p>
        </div>
        <button
          id="add-log-btn"
          onClick={() => setIsAddingLog(!isAddingLog)}
          className="px-4 py-2.5 bg-emerald-600 rounded-lg text-sm font-semibold text-white flex items-center gap-1.5 cursor-pointer"
        >
          {isAddingLog ? (
            <>
              <X className="w-4 h-4" />
              Close
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Log
            </>
          )}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Blood Pressure",
            value: "120/80",
            icon: HeartPulse,
            trend: "up",
            color: "from-rose-500 to-pink-500",
          },
          {
            label: "Temperature",
            value: "98.6°F",
            icon: Thermometer,
            trend: "stable",
            color: "from-amber-500 to-orange-500",
          },
          {
            label: "Heart Rate",
            value: "72 bpm",
            icon: Activity,
            trend: "down",
            color: "from-blue-500 to-indigo-500",
          },
          {
            label: "SpO2",
            value: "97%",
            icon: Droplets,
            trend: "stable",
            color: "from-teal-500 to-cyan-500",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-blue-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Add Log Form (Inline) ──────────────────────── */}
      {isAddingLog && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-5">
            Add New Health Log
          </h3>

          <div className="space-y-4">
            {/* Row 1: Metric Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Metric Type
              </label>
              <select
                id="metric-type-select"
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border-none outline-none cursor-pointer appearance-auto"
              >
                {metricOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Row 2: Value */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Value
              </label>
              <input
                id="metric-value-input"
                type="text"
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                placeholder="e.g. 120/80 mmHg"
                className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border-none outline-none placeholder:text-gray-400"
              />
            </div>

            {/* Row 3: Optional Note */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Optional Note
              </label>
              <input
                id="metric-note-input"
                type="text"
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Any additional notes..."
                className="w-full px-4 py-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 border-none outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button
              id="cancel-log-btn"
              onClick={handleCancel}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-log-btn"
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-semibold text-white cursor-pointer"
            >
              Save Log
            </button>
          </div>
        </div>
      )}

      {/* ── Logs List ──────────────────────────────────── */}
      <div className="space-y-3">
        {logs.map((log, idx) => {
          const config = statusConfig[log.status] || statusConfig.normal;
          const Icon = iconMap[log.type] || Activity;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {log.type}
                  </h4>
                  <p className="text-xs text-gray-400">{log.date}</p>
                  {log.note && (
                    <p className="text-xs text-gray-500 mt-0.5 italic">
                      {log.note}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${config.color}`}>
                  {log.value}
                </span>
                <span
                  className={`block text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color} mt-1`}
                >
                  {config.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
