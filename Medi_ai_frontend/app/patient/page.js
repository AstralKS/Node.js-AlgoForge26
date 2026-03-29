"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MessageSquare,
  Loader2,
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
        const actualMeds = Array.isArray(meds) ? [...meds] : [];
        if (!actualMeds.some(m => m.id === 'dummy1')) {
          actualMeds.push(
            { id: 'dummy1', name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily' },
            { id: 'dummy2', name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals' }
          );
        }
        setMedications(actualMeds);
        setLogs(Array.isArray(logData) ? logData : []);
      })
      .catch(() => { })
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
    } catch { }
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
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [patientId]);

  // Get latest value for each type
  const latest = {};
  biometrics.forEach((b) => {
    if (!latest[b.type] || new Date(b.timestamp) > new Date(latest[b.type].timestamp)) {
      latest[b.type] = b;
    }
  });

  // Build chart data from biometrics grouped by day, mixed with dummy data
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en", { weekday: "short" });
  });
  
  const dayMap = {};
  const bpVals = [115, 120, 118, 122, 119, 121, 117];
  const hrVals = [68, 72, 75, 70, 74, 71, 72];
  const tempVals = [98.2, 98.6, 98.4, 98.7, 98.6, 98.5, 98.5];
  
  last7Days.forEach((name, i) => {
    dayMap[name] = { name, bp: bpVals[i], hr: hrVals[i], temp: tempVals[i] };
  });

  biometrics.forEach((b) => {
    const day = new Date(b.timestamp).toLocaleDateString("en", { weekday: "short" });
    if (dayMap[day]) {
      if (b.type === "bp") {
        const systolic = parseInt(b.value) || parseInt(b.value?.split("/")[0]);
        dayMap[day].bp = systolic;
      }
      if (b.type === "heart_rate") dayMap[day].hr = parseFloat(b.value);
      if (b.type === "temperature") dayMap[day].temp = parseFloat(b.value);
    }
  });
  const chartData = Object.values(dayMap);

  const quickStats = [
    {
      icon: HeartPulse,
      label: "BP",
      value: latest.bp?.value || "117/78",
      color: "text-rose-500",
    },
    {
      icon: Thermometer,
      label: "Temp",
      value: latest.temperature ? `${latest.temperature.value}°F` : "98.5°F",
      color: "text-amber-500",
    },
    {
      icon: Droplets,
      label: "SpO2",
      value: latest.spo2 ? `${latest.spo2.value}%` : "98%",
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
      <div className="h-40 min-h-[160px] w-full mt-2">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={160}>
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
              <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 3 }} name="Temperature" />
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
      .catch(() => { })
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

function AIAnalysisSection() {
  const [showModal, setShowModal] = useState(false);

  const weeklyReports = [
    {
      id: 1,
      date: "Week of March 16-22, 2026",
      symptoms: ["Persistent headache", "Fatigue", "Mild dizziness"],
      soap: {
        subjective: "Headache 4/10, fatigue, morning dizziness. No fever. Sleep slightly improved.",
        objective: "BP 128/82, HR 72, Temp 98.4°F. Mild dehydration. Neuro exam normal.",
        assessment: "Tension headache from stress/dehydration. Orthostatic dizziness. Improving trend.",
        plan: "1. Hydrate — 8 glasses/day\n2. Sleep 7-8 hrs/night\n3. Stress management (breathing, meditation)\n4. Follow up in 1 week if persists"
      }
    },
    {
      id: 2,
      date: "Week of March 9-15, 2026",
      symptoms: ["Joint pain in knees", "Back stiffness"],
      soap: {
        subjective: "Bilateral knee pain with standing. Morning back stiffness ~30 min. Improving with PT.",
        objective: "BP 134/86, HR 68. Full ROM in spine. No knee swelling or tenderness. Gait normal.",
        assessment: "Mild osteoarthritis + mechanical back pain. No inflammatory signs.",
        plan: "1. Acetaminophen 500mg PRN\n2. Back stretches 15 min 2×/day\n3. Knee brace for prolonged standing\n4. PT referral if worsening"
      }
    },
    {
      id: 3,
      date: "Week of March 2-8, 2026",
      symptoms: ["Seasonal allergies", "Sore throat", "Congestion"],
      soap: {
        subjective: "Congestion, sore throat, itchy eyes — 5 days, progressive. No fever. Cetirizine partial relief.",
        objective: "BP 126/80, HR 70, Temp 98.6°F. Pharyngeal erythema, edematous turbinates. Lungs clear.",
        assessment: "Allergic rhinitis with secondary pharyngitis. URI unlikely (no fever, gradual onset).",
        plan: "1. Switch to fexofenadine 180mg daily\n2. Add fluticasone nasal spray\n3. Saline irrigation 2×/day\n4. Return if fever or no improvement in 5 days"
      }
    }
  ];

  return (
    <>
      <motion.div variants={fadeUp} custom={3} className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Health Analysis</h3>
              <p className="text-xs text-gray-400">Weekly insights & recommendations</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary text-sm py-2 px-4"
          >
            View Reports
          </button>
        </div>
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
              <Activity className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-medium text-violet-700">Weekly Summary:</span> Your health metrics show improvement in cardiovascular markers this week. Continue maintaining current medication schedule and sleep patterns.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">AI Health Analysis Reports</h2>
                    <p className="text-violet-200 text-sm">Weekly SOAP reports with symptoms and recommendations</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-10 h-10 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 100px)" }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {weeklyReports.slice(0, 2).map((report) => (
                    <div key={report.id} className="card p-5 flex flex-col h-[420px]">
                      <div className="flex items-center gap-3 mb-4 shrink-0">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                          <CalendarDays className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{report.date}</h3>
                          <p className="text-xs text-gray-400">AI-Generated Report</p>
                        </div>
                      </div>

                      <div className="mb-4 shrink-0">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          Reported Symptoms
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {report.symptoms.map((symptom, idx) => (
                            <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                              {symptom}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                        <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                          <h4 className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            Subjective
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.soap.subjective}</p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                          <h4 className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            Objective
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.soap.objective}</p>
                        </div>

                        <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                          <h4 className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                            Assessment
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">{report.soap.assessment}</p>
                        </div>

                        <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                          <h4 className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                            Plan
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{report.soap.plan}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1">
                  <div className="card p-5 flex flex-col h-[420px]">
                    <div className="flex items-center gap-3 mb-4 shrink-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center">
                        <CalendarDays className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{weeklyReports[2].date}</h3>
                        <p className="text-xs text-gray-400">AI-Generated Report</p>
                      </div>
                    </div>

                    <div className="mb-4 shrink-0">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        Reported Symptoms
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {weeklyReports[2].symptoms.map((symptom, idx) => (
                          <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-200">
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                        <h4 className="text-xs font-bold text-emerald-700 mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Subjective
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{weeklyReports[2].soap.subjective}</p>
                      </div>

                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                          Objective
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{weeklyReports[2].soap.objective}</p>
                      </div>

                      <div className="bg-violet-50 rounded-xl p-3 border border-violet-100">
                        <h4 className="text-xs font-bold text-violet-700 mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                          Assessment
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">{weeklyReports[2].soap.assessment}</p>
                      </div>

                      <div className="bg-rose-50 rounded-xl p-3 border border-rose-100">
                        <h4 className="text-xs font-bold text-rose-700 mb-1 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Plan
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{weeklyReports[2].soap.plan}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function FutureVisitsCard() {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Dummy dates (15th and 22nd of current month, and 5th of next month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const highlightedDates = [
    new Date(currentYear, currentMonth, 15),
    new Date(currentYear, currentMonth, 22),
    new Date(currentYear, currentMonth + 1, 5),
  ];

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isHighlighted = (day) => {
    return highlightedDates.some(
      (d) => d.getDate() === day && d.getMonth() === month && d.getFullYear() === year
    );
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="flex flex-col h-full bg-white border-l border-border p-5 border-b overflow-y-auto">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Future Visits</h3>
          <p className="text-xs text-gray-400">Upcoming appointments</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">{monthNames[month]} {year}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const highlighted = isHighlighted(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear();
            return (
              <div
                key={day}
                className={`p-1.5 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${highlighted
                  ? "bg-indigo-500 text-white font-bold shadow-md transform hover:scale-110"
                  : isToday
                    ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100"
                    : "text-gray-700 hover:bg-gray-200 font-medium"
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 space-y-2">
        {highlightedDates.filter(d => d.getMonth() === month && d.getFullYear() === year).map((d, i) => (
          <div key={i} className="flex items-center gap-3 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">{monthNames[d.getMonth()]} {d.getDate()}, {d.getFullYear()}</span>
              <span className="text-xs text-gray-500">Dr. Smith • General Checkup</span>
            </div>
          </div>
        ))}
        {highlightedDates.filter(d => d.getMonth() === month && d.getFullYear() === year).length === 0 && (
          <div className="p-3 text-center text-sm text-gray-400 bg-gray-50 rounded-lg">No appointments this month</div>
        )}
      </div>
    </div>
  );
}

function DoctorMessagesCard() {
  const dummyMessages = [
    {
      id: 1,
      doctor: "Dr. Sarah Jenkins",
      date: "Today, 10:30 AM",
      content: "Please remember to take your new blood pressure medication with food to avoid any stomach upset. If you feel dizzy, please reach out.",
      isImportant: true,
    },
    {
      id: 2,
      doctor: "Dr. Robert Chen",
      date: "Yesterday, 2:15 PM",
      content: "Your recent lab test results look good. Keep up the diet and exercise routine that we discussed last week.",
      isImportant: false,
    }
  ];

  return (
    <div className="flex flex-col h-full bg-white border-l border-border p-5">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Doctor's Advice</h3>
          <p className="text-xs text-gray-400">Important messages from your care team</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {dummyMessages.map((msg) => (
          <div key={msg.id} className={`p-4 rounded-xl border ${msg.isImportant ? 'bg-rose-50 border-rose-100' : 'bg-gray-50 border-gray-100'} relative overflow-hidden group`}>
            {msg.isImportant && (
              <div className="absolute top-0 right-0 w-10 h-10 bg-rose-500 rotate-45 transform translate-x-5 -translate-y-5 flex items-end justify-center pb-1">
                <AlertCircle className="w-3 h-3 text-white -rotate-45" />
              </div>
            )}
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-bold text-gray-800">{msg.doctor}</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-2">{msg.content}</p>
            <span className="text-xs font-medium text-gray-400">{msg.date}</span>
          </div>
        ))}
      </div>
    </div>
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
        <div className="mb-6">
          <AIAnalysisSection />
        </div>
        <div className="grid lg:grid-cols-1 gap-6">
          <HealthLogsSection />
        </div>
      </motion.div>

      {/* Right Sidebar Sections */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-80 flex flex-col flex-shrink-0 h-full bg-white shadow-[-4px_0_12px_rgba(0,0,0,0.02)] z-10"
      >
        <div className="flex-1 overflow-hidden" style={{ minHeight: "50%" }}>
          <FutureVisitsCard />
        </div>
        <div className="flex-1 overflow-hidden" style={{ minHeight: "50%" }}>
          <DoctorMessagesCard />
        </div>
      </motion.div>
    </div>
  );
}
