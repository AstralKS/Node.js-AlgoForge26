"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  Activity,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Stethoscope,
  ClipboardList,
  FileSearch,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

const weeklyReports = [
  {
    id: 1,
    weekLabel: "This Week",
    date: "March 23 – 29, 2026",
    statusColor: "from-emerald-500 to-green-500",
    statusBg: "bg-emerald-50",
    statusText: "text-emerald-700",
    statusLabel: "Improving",
    symptoms: [
      { name: "Persistent headache", severity: "Moderate" },
      { name: "Fatigue", severity: "Mild" },
      { name: "Mild dizziness", severity: "Mild" },
    ],
    soap: {
      subjective:
        "Headache 4/10, fatigue, morning dizziness. No fever. Sleep slightly improved from prior week.",
      objective:
        "BP 128/82 (↓ from 134/86), HR 72, Temp 98.4°F, SpO2 98%. Mild dehydration. Neuro exam normal.",
      assessment:
        "Tension headache from stress/dehydration. Orthostatic dizziness. Improving trend overall.",
      plan: "1. Hydrate — 8 glasses/day\n2. Sleep 7-8 hrs/night\n3. Stress management (breathing, meditation)\n4. Follow up in 1 week if headache persists",
    },
  },
  {
    id: 2,
    weekLabel: "Last Week",
    date: "March 16 – 22, 2026",
    statusColor: "from-amber-500 to-orange-500",
    statusBg: "bg-amber-50",
    statusText: "text-amber-700",
    statusLabel: "Stable",
    symptoms: [
      { name: "Joint pain in knees", severity: "Moderate" },
      { name: "Back stiffness", severity: "Mild" },
      { name: "Mild insomnia", severity: "Mild" },
    ],
    soap: {
      subjective:
        "Bilateral knee pain with standing. Morning back stiffness ~30 min. Difficulty falling asleep. Improving with PT.",
      objective:
        "BP 134/86, HR 68, Temp 98.6°F. Full ROM in spine. No knee swelling or tenderness. Gait normal.",
      assessment:
        "Mild osteoarthritis + mechanical back pain. No inflammatory signs. Insomnia likely pain-related.",
      plan: "1. Acetaminophen 500mg PRN\n2. Back stretches 15 min 2×/day\n3. Knee brace for prolonged standing\n4. PT referral if worsening",
    },
  },
  {
    id: 3,
    weekLabel: "2 Weeks Ago",
    date: "March 9 – 15, 2026",
    statusColor: "from-rose-500 to-red-500",
    statusBg: "bg-rose-50",
    statusText: "text-rose-700",
    statusLabel: "Needs Attention",
    symptoms: [
      { name: "Seasonal allergies", severity: "Moderate" },
      { name: "Sore throat", severity: "Moderate" },
      { name: "Nasal congestion", severity: "Severe" },
      { name: "Itchy eyes", severity: "Mild" },
    ],
    soap: {
      subjective:
        "Congestion, sore throat, itchy eyes — 5 days, progressive. No fever. Cetirizine 10mg giving partial relief only.",
      objective:
        "BP 126/80, HR 70, Temp 98.6°F. Pharyngeal erythema, edematous turbinates. Lungs clear. Conjunctivae injected.",
      assessment:
        "Allergic rhinitis with secondary pharyngitis. URI unlikely (no fever, gradual onset, allergy history).",
      plan: "1. Switch to fexofenadine 180mg daily\n2. Add fluticasone nasal spray\n3. Saline irrigation 2×/day\n4. Return if fever or no improvement in 5 days",
    },
  },
];

/* ─── Severity badge color helper ──────────────────── */
function severityColor(sev) {
  switch (sev) {
    case "Severe":
      return "bg-red-100 text-red-700 border-red-200";
    case "Moderate":
      return "bg-amber-100 text-amber-700 border-amber-200";
    default:
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
}

/* ─── SOAP section colors ──────────────────────────── */
const soapConfig = {
  subjective: {
    icon: Stethoscope,
    label: "Subjective",
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    title: "text-emerald-700",
  },
  objective: {
    icon: FileSearch,
    label: "Objective",
    bg: "bg-blue-50",
    border: "border-blue-100",
    dot: "bg-blue-500",
    title: "text-blue-700",
  },
  assessment: {
    icon: Activity,
    label: "Assessment",
    bg: "bg-violet-50",
    border: "border-violet-100",
    dot: "bg-violet-500",
    title: "text-violet-700",
  },
  plan: {
    icon: ClipboardList,
    label: "Plan",
    bg: "bg-rose-50",
    border: "border-rose-100",
    dot: "bg-rose-500",
    title: "text-rose-700",
  },
};

/* ─── Single Report Card ──────────────────────────── */
function ReportCard({ report, index }) {
  return (
    <motion.div
      variants={fadeUp}
      custom={index + 1}
      className="card-static flex flex-col h-[520px] overflow-hidden group"
      style={{
        border: "1px solid rgba(0,0,0,0.04)",
      }}
    >
      {/* Header */}
      <div className="p-5 pb-3 shrink-0">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl bg-gradient-to-br ${report.statusColor} flex items-center justify-center shadow-lg shadow-violet-500/10`}
            >
              <CalendarDays className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-[15px]">
                {report.weekLabel}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">{report.date}</p>
            </div>
          </div>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${report.statusBg} ${report.statusText} border ${report.statusBg.replace("bg-", "border-").replace("50", "200")}`}
          >
            {report.statusLabel}
          </span>
        </div>

        {/* Symptoms */}
        <div className="mb-1">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Reported Symptoms
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {report.symptoms.map((symptom, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-full border ${severityColor(symptom.severity)}`}
              >
                {symptom.name}
                <span className="opacity-60 ml-1">• {symptom.severity}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent shrink-0" />

      {/* SOAP Sections — scrollable */}
      <div className="flex-1 overflow-y-auto p-5 pt-3 space-y-3 scrollbar-smooth">
        {Object.entries(soapConfig).map(([key, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div
              key={key}
              className={`${cfg.bg} rounded-xl p-3.5 border ${cfg.border} transition-all duration-200 hover:shadow-sm`}
            >
              <h4
                className={`text-xs font-bold ${cfg.title} mb-1.5 flex items-center gap-1.5`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cfg.label}
              </h4>
              <p className="text-[13px] text-gray-700 leading-relaxed whitespace-pre-line">
                {report.soap[key]}
              </p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ─── Page Component ──────────────────────────────── */
export default function AIAnalysisPage() {
  return (
    <div className="h-full overflow-y-auto">
      <motion.div
        initial="hidden"
        animate="visible"
        className="p-6 max-w-[1400px] mx-auto"
      >
        {/* Page Header */}
        <motion.div variants={fadeUp} custom={0} className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                AI Health Analysis
                <Sparkles className="w-5 h-5 text-violet-500" />
              </h1>
              <p className="text-gray-500 text-sm mt-0.5">
                Weekly SOAP reports generated from your health data, symptoms & appointments
              </p>
            </div>
          </div>

          {/* Summary Banner */}
          <motion.div
            variants={fadeUp}
            custom={0.5}
            className="mt-5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-5 text-white relative overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-20 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />

            <div className="relative flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
                <div>
                  <p className="text-xs text-violet-200">Health Trend</p>
                  <p className="font-bold text-sm">Improving ↑</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                <ShieldCheck className="w-5 h-5 text-blue-300" />
                <div>
                  <p className="text-xs text-violet-200">Reports Generated</p>
                  <p className="font-bold text-sm">3 Weekly Reports</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur rounded-xl px-4 py-2.5">
                <Activity className="w-5 h-5 text-amber-300" />
                <div>
                  <p className="text-xs text-violet-200">Symptoms Tracked</p>
                  <p className="font-bold text-sm">10 Total</p>
                </div>
              </div>
              <div className="ml-auto hidden lg:flex items-center gap-2 text-sm text-violet-200">
                <Sparkles className="w-4 h-4" />
                AI-powered insights from your data
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Reports Grid: 2 on top, 1 on bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ReportCard report={weeklyReports[0]} index={0} />
          <ReportCard report={weeklyReports[1]} index={1} />
        </div>
        <div className="grid grid-cols-1 gap-6 mb-8">
          <ReportCard report={weeklyReports[2]} index={2} />
        </div>

        {/* Footer hint */}
        <motion.div
          variants={fadeUp}
          custom={5}
          className="text-center pb-6"
        >
          <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
            <Bot className="w-4 h-4" />
            Reports are updated weekly based on your logged health data
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
