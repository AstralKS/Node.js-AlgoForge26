"use client";

import { motion } from "framer-motion";
import { CalendarDays, MapPin, Clock, User, FileText } from "lucide-react";

const visits = [
  {
    date: "Mar 26, 2026",
    doctor: "Dr. Amit Patel",
    type: "General Checkup",
    location: "MEDI.AI Clinic, Mumbai",
    time: "10:30 AM",
    notes: "Routine checkup. Blood work ordered. BP normal at 120/80. Continue current medications.",
    status: "completed",
  },
  {
    date: "Mar 15, 2026",
    doctor: "Dr. Sneha Kapoor",
    type: "Follow-up",
    location: "City Hospital, Room 204",
    time: "2:00 PM",
    notes: "Follow-up on medication adjustment. Patient reports improvement. No adverse effects.",
    status: "completed",
  },
  {
    date: "Apr 5, 2026",
    doctor: "Dr. Amit Patel",
    type: "Lab Review",
    location: "MEDI.AI Clinic, Mumbai",
    time: "11:00 AM",
    notes: "Review blood work results and adjust treatment plan if needed.",
    status: "upcoming",
  },
  {
    date: "Apr 20, 2026",
    doctor: "Dr. Rahul Verma",
    type: "Specialist Consultation",
    location: "Heart Care Center, Pune",
    time: "3:30 PM",
    notes: "Cardiac evaluation. Bring previous ECG reports.",
    status: "upcoming",
  },
];

export default function VisitsPage() {
  return (
    <div className="p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Visits</h1>
        <p className="text-gray-500 mb-6">View your past and upcoming appointments</p>
      </motion.div>

      <div className="space-y-4">
        {visits.map((visit, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    visit.status === "upcoming"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-primary-100 text-primary"
                  }`}
                >
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{visit.type}</h3>
                  <p className="text-sm text-gray-500">{visit.date}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  visit.status === "upcoming"
                    ? "bg-blue-50 text-blue-600"
                    : "bg-primary-50 text-primary"
                }`}
              >
                {visit.status === "upcoming" ? "Upcoming" : "Completed"}
              </span>
            </div>

            <div className="grid sm:grid-cols-3 gap-3 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="w-4 h-4" />
                {visit.doctor}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                {visit.time}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {visit.location}
              </div>
            </div>

            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
              <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-600">{visit.notes}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
