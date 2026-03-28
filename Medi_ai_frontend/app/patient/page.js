"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
  Loader2,
  AlertCircle,
  Plus,
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
import { useAuth } from "@/lib/auth-context";
import * as medicationService from "@/lib/services/medicationService";
import * as biometricService from "@/lib/services/biometricService";
import * as symptomService from "@/lib/services/symptomService";
import * as aiService from "@/lib/services/aiService";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function GreetingSection() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const name = user?.name?.split(" ")[0] || "Patient";

  return (
    <motion.div variants={fadeUp} custom={0} className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {greeting}, <span className="text-primary">{name}</span> 👋
      </h1>
      <p className="text-gray-500 mt-1">Here&apos;s your health summary for today</p>
    </motion.div>
  );
}

function MedicationCard() {
  const { patientId } = useAuth();
  const [medications, setMedications] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loggingId, setLoggingId] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      medicationService.getActiveMedications(patientId),
      medicationService.getMedicationLogs(patientId),
    ])
      .then(([meds, logData]) => {
        setMedications(Array.isArray(meds) ? meds : []);
        setLogs(Array.isArray(logData) ? logData : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const todayStr = new Date().toISOString().split("T")[0];
  const todayLogs = logs.filter((l) => l.scheduled_time?.startsWith(todayStr) || l.created_at?.startsWith(todayStr));

  const isTakenToday = (medId) => todayLogs.some((l) => l.medication_id === medId && l.taken);

  const handleToggle = async (med) => {
    if (isTakenToday(med.id)) return;
    setLoggingId(med.id);
    try {
      const log = await medicationService.logMedication({
        medication_id: med.id,
        patient_id: patientId,
        taken: true,
        scheduled_time: new Date().toISOString(),
        actual_time: new Date().toISOString(),
      });
      setLogs((prev) => [...prev, log]);
    } catch {}
    setLoggingId(null);
  };

  if (loading) {
    return (
      <motion.div variants={fadeUp} custom={1} className="card p-5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} custom={1} className="card p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Pill className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Today&apos;s Medication</h3>
          <p className="text-xs text-gray-400">
            {medications.length} medication{medications.length !== 1 ? "s" : ""} active
          </p>
        </div>
      </div>
      {medications.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No active medications</p>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => {
            const taken = isTakenToday(med.id);
            return (
              <div
                key={med.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-primary-50 transition-colors cursor-pointer"
                onClick={() => handleToggle(med)}
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block">
                      {med.name} — {med.dosage}
                    </span>
                    <span className="text-xs text-gray-400">{med.frequency}</span>
                  </div>
                </div>
                {loggingId === med.id ? (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                ) : taken ? (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function HealthDataCard() {
  const { patientId } = useAuth();
  const [biometrics, setBiometrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    biometricService
      .getRecentBiometrics(patientId, 7)
      .then((data) => setBiometrics(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  // Get latest value for each type
  const latest = {};
  biometrics.forEach((b) => {
    if (!latest[b.type] || new Date(b.timestamp) > new Date(latest[b.type].timestamp)) {
      latest[b.type] = b;
    }
  });

  // Build chart data from biometrics grouped by day
  const dayMap = {};
  biometrics.forEach((b) => {
    const day = new Date(b.timestamp).toLocaleDateString("en", { weekday: "short" });
    if (!dayMap[day]) dayMap[day] = { name: day };
    if (b.type === "bp") {
      const systolic = parseInt(b.value) || parseInt(b.value?.split("/")[0]);
      dayMap[day].bp = systolic;
    }
    if (b.type === "heart_rate") dayMap[day].hr = parseFloat(b.value);
    if (b.type === "temperature") dayMap[day].temp = parseFloat(b.value);
  });
  const chartData = Object.values(dayMap);

  const quickStats = [
    {
      icon: HeartPulse,
      label: "BP",
      value: latest.bp?.value || "—",
      color: "text-rose-500",
    },
    {
      icon: Thermometer,
      label: "Temp",
      value: latest.temperature ? `${latest.temperature.value}°F` : "—",
      color: "text-amber-500",
    },
    {
      icon: Droplets,
      label: "SpO2",
      value: latest.spo2 ? `${latest.spo2.value}%` : "—",
      color: "text-blue-500",
    },
  ];

  if (loading) {
    return (
      <motion.div variants={fadeUp} custom={2} className="card p-5 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </motion.div>
    );
  }

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
        {quickStats.map((stat) => (
          <div key={stat.label} className="text-center p-2 bg-gray-50 rounded-xl">
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <div className="text-sm font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="h-40">
        {chartData.length > 0 ? (
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
              <Line type="monotone" dataKey="bp" stroke="#16a34a" strokeWidth={2} dot={{ fill: "#16a34a", r: 3 }} name="BP (systolic)" />
              <Line type="monotone" dataKey="hr" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 3 }} name="Heart Rate" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-gray-400">
            No biometric data yet. Log your first reading!
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HealthLogsSection() {
  const { patientId } = useAuth();
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    symptomService
      .getRecentSymptoms(patientId, 7)
      .then((data) => setSymptoms(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const severityStatus = (s) => {
    if (s >= 7) return { color: "text-danger", bg: "bg-red-50", label: "Severe" };
    if (s >= 4) return { color: "text-warning", bg: "bg-amber-50", label: "Moderate" };
    return { color: "text-primary", bg: "bg-primary-50", label: "Mild" };
  };

  if (loading) {
    return (
      <motion.div variants={fadeUp} custom={4} className="card p-5 flex items-center justify-center min-h-[160px]">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </motion.div>
    );
  }

  return (
    <motion.div variants={fadeUp} custom={4} className="card p-5">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Symptoms</h3>
      {symptoms.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No recent symptoms logged</p>
      ) : (
        <div className="space-y-2">
          {symptoms.slice(0, 5).map((s) => {
            const status = severityStatus(s.severity);
            return (
              <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${status.color === "text-primary" ? "bg-primary" : status.color === "text-warning" ? "bg-warning" : "bg-danger"}`} />
                  <div>
                    <span className="text-sm font-medium text-gray-700 block truncate max-w-[200px]">
                      {s.description}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(s.date || s.created_at).toLocaleDateString()} · via {s.source}
                    </span>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
                  {status.label} ({s.severity}/10)
                </span>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function AiPanel() {
  const { patientId } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm your AI health assistant. Ask me about your symptoms, medications, or health status. I'll analyze them using real medical AI.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setThinking(true);

    try {
      const result = await aiService.analyzeSymptoms(userMsg, patientId);
      let reply = "";
      if (typeof result === "string") {
        reply = result;
      } else if (result?.analysis) {
        const a = result.analysis;
        if (typeof a === "string") {
          reply = a;
        } else {
          // Format structured analysis
          const parts = [];
          if (a.assessment) parts.push(`**Assessment:** ${a.assessment}`);
          if (a.possible_conditions?.length) parts.push(`**Possible Conditions:** ${a.possible_conditions.join(", ")}`);
          if (a.severity_assessment) parts.push(`**Severity:** ${a.severity_assessment}`);
          if (a.recommendations?.length) parts.push(`**Recommendations:**\n${a.recommendations.map((r) => `• ${r}`).join("\n")}`);
          if (a.urgency) parts.push(`**Urgency:** ${a.urgency}`);
          reply = parts.length > 0 ? parts.join("\n\n") : JSON.stringify(a, null, 2);
        }
      } else {
        reply = typeof result === "object" ? JSON.stringify(result, null, 2) : String(result);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `Sorry, I couldn't process that. Error: ${err.message}` },
      ]);
    }
    setThinking(false);
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
              <span className="text-xs text-gray-400">Connected to AI Backend</span>
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
        {thinking && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-100 text-primary">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms..."
            disabled={thinking}
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={thinking}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
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
        <div className="grid lg:grid-cols-1 gap-6">
          <HealthLogsSection />
        </div>
      </motion.div>

      {/* AI Panel */}
      <AiPanel />
    </div>
  );
}
