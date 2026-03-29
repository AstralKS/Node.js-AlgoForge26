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

function PastVisitsCard() {
  const { patientId } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) return;
    import("@/lib/services/visitService").then(visitService => {
      visitService.getVisitsByPatient(patientId)
        .then((data) => {
          const loaded = Array.isArray(data?.data || data) ? (data?.data || data) : [];
          // Filter to strictly past or today
          const past = loaded.filter(v => new Date(v.date) <= new Date());
          setVisits(past);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    });
  }, [patientId]);

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

  const getVisitsForDay = (day) => {
    return visits.filter((v) => {
      const d = new Date(v.date);
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonthLimit = new Date();
  
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const monthVisits = visits.filter(v => {
    const d = new Date(v.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  return (
    <div className="flex flex-col h-full bg-white border-l border-border p-5 border-b overflow-y-auto">
      <div className="flex items-center gap-3 mb-4 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Past Visits</h3>
          <p className="text-xs text-gray-400">Previous appointments</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 shrink-0 shadow-sm mb-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="p-1 hover:bg-gray-200 rounded-lg transition-colors text-gray-600">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold text-gray-800 text-sm">{monthNames[month]} {year}</span>
          <button 
            onClick={nextMonth} 
            disabled={year === nextMonthLimit.getFullYear() && month === nextMonthLimit.getMonth()}
            className={`p-1 rounded-lg transition-colors ${year === nextMonthLimit.getFullYear() && month === nextMonthLimit.getMonth() ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-200 text-gray-600"}`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-400 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm relative">
          {loading && (
            <div className="absolute inset-0 bg-gray-50/80 flex items-center justify-center z-10 rounded-xl">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          )}
          {days.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dayVisits = getVisitsForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear();
            
            return (
              <div
                key={day}
                className={`p-1.5 rounded-lg flex items-center justify-center cursor-default transition-all duration-200 relative ${dayVisits.length > 0
                  ? "bg-indigo-500 text-white font-bold shadow-md transform hover:scale-110"
                  : isToday
                    ? "bg-indigo-50 text-indigo-600 font-bold border border-indigo-100"
                    : "text-gray-700 hover:bg-gray-100 font-medium"
                  }`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      <div className="shrink-0 space-y-2">
        {monthVisits.map((v, i) => (
          <div key={v.id || i} className="flex items-center gap-3 p-2.5 bg-indigo-50/50 rounded-lg border border-indigo-100/50">
            <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-800">{monthNames[new Date(v.date).getMonth()]} {new Date(v.date).getDate()}, {new Date(v.date).getFullYear()}</span>
              <span className="text-xs text-gray-500 truncate max-w-[200px]">{v.notes || "Checkup"}</span>
            </div>
          </div>
        ))}
        {!loading && monthVisits.length === 0 && (
          <div className="p-3 text-center text-sm text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">No past visits recorded this month</div>
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
          <PastVisitsCard />
        </div>
        <div className="flex-1 overflow-hidden" style={{ minHeight: "50%" }}>
          <DoctorMessagesCard />
        </div>
      </motion.div>
    </div>
  );
}
