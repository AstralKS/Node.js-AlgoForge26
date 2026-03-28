"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  AlertCircle,
  Pill,
  FileText,
  CalendarDays,
  Send,
  Trash2,
  HeartPulse,
  Clock,
} from "lucide-react";
import { patients } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function PatientDetailsPage({ params }) {
  const { id } = use(params);
  const patient = patients.find((p) => p.id === id);

  const [chatMessages, setChatMessages] = useState([
    { sender: "doctor", content: "How are you feeling today?" },
    { sender: "patient", content: "Much better, doctor. The new medicine seems to be working." },
    { sender: "doctor", content: "Great to hear! Keep monitoring your vitals and let me know if anything changes." },
  ]);
  const [chatInput, setChatInput] = useState("");

  if (!patient) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Patient not found.</p>
        <Link href="/doctor/patients" className="text-primary mt-2 inline-block no-underline">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setChatMessages([...chatMessages, { sender: "doctor", content: chatInput }]);
    setChatInput("");
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/doctor/patients"
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors no-underline"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-bold text-lg">
              {patient.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    patient.risk === "high"
                      ? "bg-red-50 text-danger"
                      : patient.risk === "moderate"
                      ? "bg-amber-50 text-warning"
                      : "bg-primary-50 text-primary"
                  }`}
                >
                  {patient.risk.charAt(0).toUpperCase() + patient.risk.slice(1)} Risk
                </span>
                <span className="text-sm text-gray-400">• {patient.condition}</span>
              </div>
            </div>
          </div>
        </div>
        <button className="px-4 py-2.5 bg-red-50 text-danger rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Delete Patient
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Age</p>
                  <p className="text-sm font-medium text-gray-700">{patient.age} years</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">{patient.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Phone className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-700">{patient.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <HeartPulse className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Condition</p>
                  <p className="text-sm font-medium text-gray-700">{patient.condition}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Symptoms */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Symptoms
            </h3>
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map((symptom, idx) => (
                <span key={idx} className="px-3 py-1.5 bg-amber-50 text-warning rounded-full text-sm font-medium">
                  {symptom}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Medicines */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Medicines
            </h3>
            <div className="space-y-2">
              {patient.medicines.map((med, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
                  <Pill className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700">{med}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visit History */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              Visit History
            </h3>
            <div className="space-y-3">
              {patient.visits.map((visit, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700">{visit.date}</span>
                  </div>
                  <p className="text-sm text-gray-600">{visit.notes}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-500" />
              Notes
            </h3>
            <p className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl leading-relaxed">
              {patient.notes}
            </p>
          </motion.div>
        </div>

        {/* Right Column - Chat */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-static flex flex-col h-fit lg:sticky lg:top-6"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Chat with Patient</h3>
            <p className="text-xs text-gray-400">Send messages directly</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === "doctor"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-700 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
