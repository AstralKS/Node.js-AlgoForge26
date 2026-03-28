"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Camera,
  Save,
  Bell,
  Shield,
  Stethoscope,
  Brain,
  AlertTriangle,
  Globe,
  Clock,
  Building2,
} from "lucide-react";

export default function DoctorSettingsPage() {
  const [formData, setFormData] = useState({
    name: "Dr. Amit Patel",
    email: "dr.amit.patel@mediai.com",
    specialization: "Cardiologist",
    phone: "+91 98765 00001",
    hospital: "MEDI.AI Clinic, Mumbai",
    experience: "15 years",
  });

  const [toggles, setToggles] = useState({
    aiReview: true,
    riskAlerts: true,
    emailNotifications: true,
    smsAlerts: false,
    autoSchedule: true,
    darkMode: false,
  });

  const handleToggle = (key) => {
    setToggles({ ...toggles, [key]: !toggles[key] });
  };

  return (
    <div className="p-6 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 mb-8">
          Manage your profile and preferences
        </p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Profile Information
        </h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
              <Stethoscope className="w-8 h-8" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{formData.name}</h3>
            <p className="text-sm text-primary font-medium">
              {formData.specialization}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {formData.experience} experience
            </p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <Stethoscope className="w-4 h-4 inline mr-2" />
              Specialization
            </label>
            <input
              type="text"
              value={formData.specialization}
              onChange={(e) =>
                setFormData({ ...formData, specialization: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <Building2 className="w-4 h-4 inline mr-2" />
              Hospital / Clinic
            </label>
            <input
              type="text"
              value={formData.hospital}
              onChange={(e) =>
                setFormData({ ...formData, hospital: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* AI & Alerts Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI & Alert Preferences
        </h2>
        <div className="space-y-4">
          {[
            {
              key: "aiReview",
              icon: Brain,
              label: "AI Review",
              desc: "Enable AI-powered analysis of patient data and treatment recommendations",
              color: "text-primary",
              bgColor: "bg-primary-50",
            },
            {
              key: "riskAlerts",
              icon: AlertTriangle,
              label: "Risk Alerts",
              desc: "Get instant notifications when a patient's health metrics indicate high risk",
              color: "text-danger",
              bgColor: "bg-red-50",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl ${item.bgColor} flex items-center justify-center`}
                >
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700">
                    {item.label}
                  </h4>
                  <p className="text-xs text-gray-400 max-w-sm">{item.desc}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                  toggles[item.key] ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`w-5.5 h-5.5 bg-white rounded-full absolute top-[3px] transition-all shadow-sm ${
                    toggles[item.key] ? "left-[22px]" : "left-[3px]"
                  }`}
                  style={{ width: "22px", height: "22px" }}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notification Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            {
              key: "emailNotifications",
              label: "Email Notifications",
              desc: "Receive patient updates via email",
            },
            {
              key: "smsAlerts",
              label: "SMS Alerts",
              desc: "Get critical alerts via SMS",
            },
            {
              key: "autoSchedule",
              label: "Auto-schedule Follow-ups",
              desc: "Automatically suggest follow-up appointment slots",
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
            >
              <div>
                <h4 className="text-sm font-medium text-gray-700">
                  {item.label}
                </h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  toggles[item.key] ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    toggles[item.key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Security */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Security
        </h2>
        <div className="space-y-3">
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                  Change Password
                </h4>
                <p className="text-xs text-gray-400">
                  Last changed 30 days ago
                </p>
              </div>
              <span className="text-xs text-primary font-medium">Update →</span>
            </div>
          </button>
          <button className="w-full text-left p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-700 group-hover:text-primary transition-colors">
                  Two-Factor Authentication
                </h4>
                <p className="text-xs text-gray-400">
                  Add an extra layer of security
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary">
                Enabled
              </span>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button className="btn-primary">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </motion.div>
    </div>
  );
}
