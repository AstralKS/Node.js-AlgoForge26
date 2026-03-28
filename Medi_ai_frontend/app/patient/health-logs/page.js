"use client";

import { motion } from "framer-motion";
import {
  Thermometer,
  HeartPulse,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";
import { healthLogs } from "@/lib/data";

const statusConfig = {
  normal: { color: "text-primary", bg: "bg-primary-50", label: "Normal" },
  warning: { color: "text-warning", bg: "bg-amber-50", label: "Elevated" },
  critical: { color: "text-danger", bg: "bg-red-50", label: "Critical" },
};

const iconMap = {
  Temperature: Thermometer,
  "Blood Pressure": HeartPulse,
  "Heart Rate": Activity,
  "Blood Sugar": Droplets,
  SpO2: Droplets,
};

export default function HealthLogsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Logs</h1>
          <p className="text-gray-500">Track your daily health metrics</p>
        </div>
        <button className="btn-primary text-sm py-2.5 px-4">
          <Plus className="w-4 h-4" />
          Add Log
        </button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {[
          { label: "Blood Pressure", value: "120/80", icon: HeartPulse, trend: "up", color: "from-rose-500 to-pink-500" },
          { label: "Temperature", value: "98.6°F", icon: Thermometer, trend: "stable", color: "from-amber-500 to-orange-500" },
          { label: "Heart Rate", value: "72 bpm", icon: Activity, trend: "down", color: "from-blue-500 to-indigo-500" },
          { label: "SpO2", value: "97%", icon: Droplets, trend: "stable", color: "from-teal-500 to-cyan-500" },
        ].map((stat, idx) => (
          <div key={idx} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
              {stat.trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-primary" />
              ) : stat.trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-blue-500" />
              ) : (
                <Activity className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Logs List */}
      <div className="space-y-3">
        {healthLogs.map((log, idx) => {
          const config = statusConfig[log.status];
          const Icon = iconMap[log.type] || Activity;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="card p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{log.type}</h4>
                  <p className="text-xs text-gray-400">{log.date}</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-lg font-bold ${config.color}`}>
                  {log.value}
                </span>
                <span className={`block text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                  {config.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
