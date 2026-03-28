"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Pill,
  HeartPulse,
  Thermometer,
  CheckCircle2,
  Clock,
  Send,
  Mic,
  Bot,
  User,
  Activity,
  Droplets,
  MessageSquare,
  ArrowUpRight,
  Stethoscope,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { medications, healthLogs, aiMessages, chartData } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function GreetingSection() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <motion.div variants={fadeUp} custom={0} className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {greeting}, <span className="text-primary">User</span> 👋
      </h1>
      <p className="text-gray-500 mt-1">Here&apos;s your health summary for today</p>
    </motion.div>
  );
}

function MedicationCard() {
  return (
    <motion.div variants={fadeUp} custom={1} className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Today&apos;s Medication</h3>
          <p className="text-xs text-gray-400">4 medications scheduled</p>
        </div>
      </div>
      <div className="space-y-3">
        {medications.map((med, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <span className="text-sm font-medium text-gray-700 block">
                  {med.name}
                </span>
                <span className="text-xs text-gray-400">{med.time}</span>
              </div>
            </div>
            {med.taken ? (
              <CheckCircle2 className="w-5 h-5 text-primary" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function HealthDataCard() {
  return (
    <motion.div variants={fadeUp} custom={2} className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Health Biometrics</h3>
          <p className="text-xs text-gray-400">Last 7 days trend</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { icon: HeartPulse, label: "BP", value: "120/80", color: "text-rose-500" },
          { icon: Thermometer, label: "Temp", value: "98.6°F", color: "text-amber-500" },
          { icon: Droplets, label: "SpO2", value: "97%", color: "text-blue-500" },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2 bg-gray-50 rounded-xl">
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <div className="text-sm font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="bp"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ fill: "#16a34a", r: 3 }}
              name="Blood Pressure"
            />
            <Line
              type="monotone"
              dataKey="hr"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 3 }}
              name="Heart Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

function MessagesSection() {
  const recentConvos = [
    {
      doctor: "Dr. Amit Patel",
      specialty: "Endocrinologist",
      avatar: "AP",
      preview: "Continue with Metformin. We'll review in 2 weeks.",
      time: "10:40 AM",
      unread: 0,
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      doctor: "Dr. Sneha Reddy",
      specialty: "Cardiologist",
      avatar: "SR",
      preview: "Your ECG report is attached. Please review.",
      time: "Yesterday",
      unread: 2,
      gradient: "from-violet-400 to-purple-500",
    },
    {
      doctor: "Dr. Ravi Kumar",
      specialty: "General Physician",
      avatar: "RK",
      preview: "Your annual checkup is due next week.",
      time: "Mon",
      unread: 1,
      gradient: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <motion.div variants={fadeUp} custom={3} className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Recent Messages</h3>
            <p className="text-xs text-gray-400">3 conversations</p>
          </div>
        </div>
        <Link
          href="/patient/messages"
          className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark transition-colors no-underline"
        >
          View All
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="space-y-2">
        {recentConvos.map((convo, idx) => (
          <Link
            key={idx}
            href="/patient/messages"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer no-underline group"
          >
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${convo.gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
              <span className="text-xs font-bold text-white">{convo.avatar}</span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className={`text-sm ${convo.unread > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"}`}>
                  {convo.doctor}
                </span>
                <span className={`text-[11px] flex-shrink-0 ml-2 ${convo.unread > 0 ? "text-primary font-semibold" : "text-gray-400"}`}>
                  {convo.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-xs truncate ${convo.unread > 0 ? "text-gray-600 font-medium" : "text-gray-400"}`}>
                  {convo.preview}
                </p>
                {convo.unread > 0 && (
                  <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white">{convo.unread}</span>
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

function HealthLogsSection() {
  return (
    <motion.div variants={fadeUp} custom={4} className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Health Logs</h3>
      <div className="space-y-2">
        {healthLogs.slice(0, 4).map((log, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-2 h-2 rounded-full ${
                  log.status === "normal" ? "bg-primary" : "bg-warning"
                }`}
              />
              <div>
                <span className="text-sm font-medium text-gray-700">
                  {log.type}
                </span>
                <span className="text-xs text-gray-400 block">{log.date}</span>
              </div>
            </div>
            <span
              className={`text-sm font-semibold ${
                log.status === "normal" ? "text-primary" : "text-warning"
              }`}
            >
              {log.value}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function AiPanel() {
  const [messages, setMessages] = useState(aiMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Thank you for sharing that. Based on your symptoms, I recommend monitoring your condition closely. Would you like me to notify your doctor?",
        },
      ]);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-80 bg-white border-l border-border flex flex-col flex-shrink-0 h-full"
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Ask AI</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
              <span className="text-xs text-gray-400">Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-primary-100 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {msg.role === "assistant" ? (
                <Bot className="w-3.5 h-3.5" />
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "assistant"
                  ? "bg-gray-50 text-gray-700 rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm"
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about your health..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <button className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-primary-50 to-primary-100 text-primary rounded-xl font-medium text-sm hover:from-primary-100 hover:to-primary-200 transition-all">
          <Mic className="w-5 h-5" />
          Voice Input
        </button>
      </div>
    </motion.div>
  );
}

export default function PatientDashboard() {
  return (
    <div className="flex h-full">
      {/* Main Content */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="flex-1 p-6 overflow-y-auto"
      >
        <GreetingSection />
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <MedicationCard />
          <HealthDataCard />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <MessagesSection />
          <HealthLogsSection />
        </div>
      </motion.div>

      {/* AI Panel */}
      <AiPanel />
    </div>
  );
}
