"use client";

import { motion } from "framer-motion";
import {
  Users,
  AlertTriangle,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { patients } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function DoctorDashboard() {
  const highRiskCount = patients.filter((p) => p.risk === "high").length;

  const recentActivity = [
    { action: "New lab results", patient: "Aarav Sharma", time: "10 min ago", type: "info" },
    { action: "Risk alert triggered", patient: "Rahul Mehta", time: "1 hour ago", type: "warning" },
    { action: "Appointment completed", patient: "Priya Patel", time: "2 hours ago", type: "success" },
    { action: "Medication updated", patient: "Sneha Gupta", time: "3 hours ago", type: "info" },
    { action: "New message received", patient: "Vikram Singh", time: "5 hours ago", type: "info" },
  ];

  return (
    <div className="p-6">
      <motion.div initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, <span className="text-primary">Dr. Patel</span> 👋
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s an overview of your practice today</p>
        </motion.div>

        {/* Summary Cards */}
        <motion.div variants={fadeUp} custom={1} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1 text-primary text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                +12%
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{patients.length}</h3>
            <p className="text-sm text-gray-500 mt-1">Total Patients</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <span className="w-3 h-3 rounded-full bg-danger pulse-green" style={{ animationName: "none", background: "#ef4444", boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.4)", animation: "pulseRed 2s infinite" }} />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{highRiskCount}</h3>
            <p className="text-sm text-gray-500 mt-1">High Risk Patients</p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-blue-500 font-medium">Today</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900">8</h3>
            <p className="text-sm text-gray-500 mt-1">Appointments Today</p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Activity
          <motion.div variants={fadeUp} custom={2} className="card-static p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentActivity.map((activity, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      activity.type === "warning"
                        ? "bg-warning"
                        : activity.type === "success"
                        ? "bg-primary"
                        : "bg-info"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-400">{activity.patient}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </motion.div> */}

          {/* Quick Patient List */}
          <motion.div variants={fadeUp} custom={3} className="card-static p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Recent Patients</h3>
              <Link
                href="/doctor/patients"
                className="text-sm text-primary font-medium flex items-center gap-1 no-underline hover:underline"
              >
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-3">
              {patients.slice(0, 4).map((patient) => (
                <Link
                  key={patient.id}
                  href={`/doctor/patients/${patient.id}`}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors no-underline group"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-semibold text-sm">
                    {patient.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-400">{patient.condition}</p>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      patient.risk === "high"
                        ? "bg-red-50 text-danger"
                        : patient.risk === "moderate"
                        ? "bg-amber-50 text-warning"
                        : "bg-primary-50 text-primary"
                    }`}
                  >
                    {patient.risk.charAt(0).toUpperCase() + patient.risk.slice(1)}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
