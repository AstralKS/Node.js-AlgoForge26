"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer,
  HeartPulse,
  Droplets,
  Activity,
  TrendingUp,
  TrendingDown,
  Plus,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as biometricService from "@/lib/services/biometricService";
import * as symptomService from "@/lib/services/symptomService";

const statusConfig = {
  normal: { color: "text-primary", bg: "bg-primary-50", label: "Normal" },
  warning: { color: "text-warning", bg: "bg-amber-50", label: "Elevated" },
  critical: { color: "text-danger", bg: "bg-red-50", label: "Critical" },
};

const iconMap = {
  temperature: Thermometer,
  bp: HeartPulse,
  heart_rate: Activity,
  glucose: Droplets,
  spo2: Droplets,
  weight: Activity,
};

const typeLabels = {
  bp: "Blood Pressure",
  temperature: "Temperature",
  heart_rate: "Heart Rate",
  glucose: "Blood Sugar",
  spo2: "SpO2",
  weight: "Weight",
};

export default function HealthLogsPage() {
  const { patientId } = useAuth();
  const [biometrics, setBiometrics] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(null); // 'biometric' | 'symptom' | null
  const [submitting, setSubmitting] = useState(false);

  // Biometric form
  const [bioForm, setBioForm] = useState({ type: "bp", value: "", unit: "mmHg" });
  // Symptom form
  const [symForm, setSymForm] = useState({ description: "", severity: 5 });

  const unitMap = {
    bp: "mmHg",
    temperature: "°F",
    heart_rate: "bpm",
    glucose: "mg/dL",
    spo2: "%",
    weight: "kg",
  };

  useEffect(() => {
    if (!patientId) return;
    Promise.all([
      biometricService.getRecentBiometrics(patientId, 30),
      symptomService.getRecentSymptoms(patientId, 30),
    ])
      .then(([bios, syms]) => {
        setBiometrics(Array.isArray(bios) ? bios : []);
        setSymptoms(Array.isArray(syms) ? syms : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [patientId]);

  const handleAddBiometric = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await biometricService.createBiometric({
        patient_id: patientId,
        type: bioForm.type,
        value: bioForm.value,
        unit: unitMap[bioForm.type] || bioForm.unit,
      });
      setBiometrics((prev) => [result, ...prev]);
      setShowModal(null);
      setBioForm({ type: "bp", value: "", unit: "mmHg" });
    } catch {}
    setSubmitting(false);
  };

  const handleAddSymptom = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await symptomService.createSymptom({
        patient_id: patientId,
        description: symForm.description,
        severity: symForm.severity,
        source: "manual",
        run_ai_analysis: true,
      });
      setSymptoms((prev) => [result, ...prev]);
      setShowModal(null);
      setSymForm({ description: "", severity: 5 });
    } catch {}
    setSubmitting(false);
  };

  // Get latest values for summary cards
  const latest = {};
  biometrics.forEach((b) => {
    if (!latest[b.type] || new Date(b.timestamp) > new Date(latest[b.type].timestamp)) {
      latest[b.type] = b;
    }
  });

  const summaryCards = [
    { label: "Blood Pressure", value: latest.bp?.value || "—", icon: HeartPulse, color: "from-rose-500 to-pink-500" },
    { label: "Temperature", value: latest.temperature ? `${latest.temperature.value}°F` : "—", icon: Thermometer, color: "from-amber-500 to-orange-500" },
    { label: "Heart Rate", value: latest.heart_rate ? `${latest.heart_rate.value} bpm` : "—", icon: Activity, color: "from-blue-500 to-indigo-500" },
    { label: "SpO2", value: latest.spo2 ? `${latest.spo2.value}%` : "—", icon: Droplets, color: "from-teal-500 to-cyan-500" },
  ];

  // Merge biometrics + symptoms into a timeline
  const allLogs = [
    ...biometrics.map((b) => ({
      id: b.id,
      type: typeLabels[b.type] || b.type,
      value: `${b.value} ${b.unit}`,
      date: b.timestamp || b.created_at,
      status: "normal",
      kind: "biometric",
      rawType: b.type,
    })),
    ...symptoms.map((s) => ({
      id: s.id,
      type: `Symptom: ${s.description?.substring(0, 40)}`,
      value: `Severity ${s.severity}/10`,
      date: s.date || s.created_at,
      status: s.severity >= 7 ? "critical" : s.severity >= 4 ? "warning" : "normal",
      kind: "symptom",
      rawType: "symptom",
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Logs</h1>
          <p className="text-gray-500">Track your daily health metrics</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal("biometric")} className="btn-primary text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Add Biometric
          </button>
          <button onClick={() => setShowModal("symptom")} className="btn-outline text-sm py-2.5 px-4">
            <Plus className="w-4 h-4" />
            Log Symptom
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        {summaryCards.map((stat, idx) => (
          <div key={idx} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="text-xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </motion.div>

      {/* Logs List */}
      {allLogs.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400">No health logs yet. Add your first entry!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {allLogs.map((log, idx) => {
            const config = statusConfig[log.status];
            const Icon = iconMap[log.rawType] || Activity;
            return (
              <motion.div
                key={log.id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="card p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{log.type}</h4>
                    <p className="text-xs text-gray-400">
                      {new Date(log.date).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg font-bold ${config.color}`}>{log.value}</span>
                  <span className={`block text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.color}`}>
                    {config.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Biometric Modal */}
      <AnimatePresence>
        {showModal === "biometric" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Biometric Reading</h3>
                <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddBiometric} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Type</label>
                  <select
                    value={bioForm.type}
                    onChange={(e) => setBioForm({ ...bioForm, type: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all"
                  >
                    <option value="bp">Blood Pressure</option>
                    <option value="heart_rate">Heart Rate</option>
                    <option value="temperature">Temperature</option>
                    <option value="glucose">Blood Sugar</option>
                    <option value="spo2">SpO2</option>
                    <option value="weight">Weight</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Value ({unitMap[bioForm.type]})
                  </label>
                  <input
                    type="text"
                    value={bioForm.value}
                    onChange={(e) => setBioForm({ ...bioForm, value: e.target.value })}
                    placeholder={bioForm.type === "bp" ? "120/80" : "72"}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Reading"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Symptom Modal */}
      <AnimatePresence>
        {showModal === "symptom" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Log Symptom</h3>
                <button onClick={() => setShowModal(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddSymptom} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                  <textarea
                    value={symForm.description}
                    onChange={(e) => setSymForm({ ...symForm, description: e.target.value })}
                    placeholder="Describe what you're feeling..."
                    required
                    rows={3}
                    className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Severity: {symForm.severity}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={symForm.severity}
                    onChange={(e) => setSymForm({ ...symForm, severity: parseInt(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Mild</span>
                    <span>Severe</span>
                  </div>
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log Symptom (with AI Analysis)"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
