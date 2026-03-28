"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Camera, Save, Bell, Shield, Moon } from "lucide-react";

export default function PatientSettingsPage() {
  const [formData, setFormData] = useState({
    name: "User",
    email: "user@example.com",
  });

  const [notifications, setNotifications] = useState({
    medication: true,
    appointments: true,
    healthAlerts: true,
  });

  return (
    <div className="p-6 max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 mb-8">Manage your account preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold">
              U
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-border flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
              <Camera className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{formData.name}</h3>
            <p className="text-sm text-gray-500">{formData.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              <User className="w-4 h-4 inline mr-2" />
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card-static p-6 mb-6"
      >
        <h2 className="font-semibold text-gray-900 mb-4">
          <Bell className="w-5 h-5 inline mr-2" />
          Notifications
        </h2>
        <div className="space-y-4">
          {[
            { key: "medication", label: "Medication Reminders", desc: "Get notified about your scheduled medications" },
            { key: "appointments", label: "Appointment Alerts", desc: "Reminders for upcoming visits" },
            { key: "healthAlerts", label: "Health Alerts", desc: "AI-detected health risk notifications" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <h4 className="text-sm font-medium text-gray-700">{item.label}</h4>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <button
                onClick={() =>
                  setNotifications({ ...notifications, [item.key]: !notifications[item.key] })
                }
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notifications[item.key] ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                    notifications[item.key] ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button className="btn-primary">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </motion.div>
    </div>
  );
}
