"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Save, Bell, FileHeart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function PatientSettingsPage() {
  const { user, patient } = useAuth();
  const [saved, setSaved] = useState(false);

  const [notifications, setNotifications] = useState({
    medication: true,
    appointments: true,
    healthAlerts: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const name = user?.name || "—";
  const email = user?.email || "—";
  const phone = user?.phone || "—";
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="p-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 mb-8">Your account information</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card-static p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-2xl font-bold">
            {initials}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{name}</h3>
            <p className="text-sm text-gray-500">{email}</p>
            <p className="text-xs text-gray-400">{phone}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <User className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">Full Name</span>
                <span className="text-xs text-gray-400">From database</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{name}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">Email</span>
                <span className="text-xs text-gray-400">Login identifier</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{email}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">Phone</span>
                <span className="text-xs text-gray-400">WhatsApp number</span>
              </div>
            </div>
            <span className="text-sm font-semibold text-gray-900">{phone}</span>
          </div>

          {patient?.current_diagnosis && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileHeart className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Current Diagnosis</span>
                  <span className="text-xs text-gray-400">Medical record</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-primary">{patient.current_diagnosis}</span>
            </div>
          )}

          {patient?.blood_group && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                <FileHeart className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="text-sm font-medium text-gray-700 block">Blood Group</span>
                </div>
              </div>
              <span className="text-sm font-semibold text-gray-900">{patient.blood_group}</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-static p-6 mb-6">
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
                onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications[item.key] ? "bg-primary" : "bg-gray-300"}`}
              >
                <span className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${notifications[item.key] ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <button onClick={handleSave} className="btn-primary">
          {saved ? (
            <>✓ Saved</>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </motion.div>
    </div>
  );
}
