"use client";

import { useState } from "react";
import {
  Search,
  FileText,
  AlertTriangle,
  Activity,
  User,
  Sparkles,
  CheckCircle2,
  Calendar,
  Circle,
  Send,
  ClipboardList,
} from "lucide-react";

/* ── Static Inbox Data ─────────────────────────────────────── */
const inboxItems = [
  {
    id: 1,
    patient: "Aarav Sharma",
    age: 45,
    condition: "Diabetes Type 2",
    type: "Weekly AI Summary",
    typeIcon: "doc",
    time: "10 min ago",
    priority: "review",
    read: false,
    snippet:
      "Patient has logged elevated fasting blood sugar levels over the last 3 days. Average fasti...",
    summary: {
      text: "Patient has logged elevated fasting blood sugar levels over the last 3 days. Average fasting reading: 140 mg/dL. No accompanying symptoms of dizziness reported. Recommendation: Review Metformin dosage.",
      confidence: "92%",
      riskLevel: "Moderate",
      entries: 5,
    },
    dayLogs: [
      {
        day: "TODAY",
        text: "Fasting and post-meal blood sugar levels remained high (Avg: 167 mg/dL). Patient added a note expressing concern about the spike.",
      },
      {
        day: "YESTERDAY",
        text: "Readings were slightly elevated but stable (Avg: 159 mg/dL). No physical symptoms reported.",
      },
      {
        day: "2 DAYS AGO",
        text: "Readings within acceptable upper limits. Patient reported feeling normal.",
      },
    ],
    actions: ["Adjust Metformin", "Schedule Follow-up", "Send Diet Plan"],
  },
  {
    id: 2,
    patient: "Priya Patel",
    age: 32,
    condition: "Hypertension",
    type: "Elevated BP Alert",
    typeIcon: "alert",
    time: "1 hour ago",
    priority: "urgent",
    read: false,
    snippet:
      "Patient recorded blood pressure readings above 145/95 mmHg on two consecutive days...",
    summary: {
      text: "Patient recorded blood pressure readings above 145/95 mmHg on two consecutive days. Current medication: Amlodipine 5mg. The AI model suggests evaluating medication adherence and considering dosage adjustment.",
      confidence: "88%",
      riskLevel: "High",
      entries: 3,
    },
    dayLogs: [
      {
        day: "TODAY",
        text: 'Blood pressure readings elevated at 148/96 mmHg. Patient noted feeling lightheaded in the morning.',
      },
      {
        day: "YESTERDAY",
        text: "Blood pressure at 146/95 mmHg. No additional symptoms logged.",
      },
    ],
    actions: ["Review Medication", "Request Lab Work", "Schedule Urgent Visit"],
  },
  {
    id: 3,
    patient: "Rahul Mehta",
    age: 58,
    condition: "Cardiac Arrhythmia",
    type: "Symptom Log Update",
    typeIcon: "activity",
    time: "3 hours ago",
    priority: "info",
    read: true,
    snippet:
      "Patient reported a 15-minute episode of palpitations last night at 11:00 PM...",
    summary: {
      text: "Patient reported a 15-minute episode of palpitations last night at 11:00 PM. No chest pain or shortness of breath accompanied the episode. ECG monitoring data from wearable shows briefly irregular rhythm.",
      confidence: "85%",
      riskLevel: "Moderate",
      entries: 2,
    },
    dayLogs: [
      {
        day: "TODAY",
        text: "Patient logged palpitations lasting 15 minutes at 11 PM. Wearable ECG flagged irregular rhythm between 10:55 PM – 11:12 PM.",
      },
    ],
    actions: ["Order ECG", "Review Wearable Data", "Adjust Beta-blocker"],
  },
];

/* ── Type Icon Lookup ──────────────────────────────────────── */
function TypeIcon({ type }) {
  if (type === "alert")
    return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
  if (type === "activity")
    return <Activity className="w-3.5 h-3.5 text-blue-500" />;
  return <FileText className="w-3.5 h-3.5 text-emerald-600" />;
}

function TypeLabel({ item }) {
  const colorMap = {
    doc: "text-emerald-600",
    alert: "text-red-500",
    activity: "text-blue-500",
  };
  return (
    <span
      className={`text-xs font-medium ${colorMap[item.typeIcon] || "text-gray-500"}`}
    >
      {item.type}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function DoctorMessagesPage() {
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [instructionText, setInstructionText] = useState("");

  const selected = inboxItems.find((i) => i.id === selectedId) || inboxItems[0];

  const filtered = inboxItems.filter(
    (item) =>
      item.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full">
      {/* ── LEFT COLUMN: Inbox List (1/3) ─────────────── */}
      <div className="w-[380px] bg-white flex flex-col flex-shrink-0 border-r border-gray-200">
        {/* Header */}
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              AI Reports
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-400 font-medium">
                AI Active
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-5">2 unread reports</p>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-reports"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients or reports..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm border-none outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Inbox Items */}
        <div className="flex-1 overflow-y-auto">
          {filtered.map((item) => {
            const isActive = selectedId === item.id;
            return (
              <button
                key={item.id}
                id={`inbox-item-${item.id}`}
                onClick={() => setSelectedId(item.id)}
                className={`w-full text-left px-6 py-5 border-b border-gray-100 cursor-pointer relative ${
                  isActive ? "bg-emerald-50/40" : "bg-white"
                }`}
              >
                {/* Active left border */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-600 rounded-r-sm" />
                )}

                {/* Top row: name + time */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {!item.read && (
                      <Circle className="w-[7px] h-[7px] text-emerald-600 fill-emerald-600 flex-shrink-0" />
                    )}
                    <span
                      className={`text-[14px] ${
                        !item.read
                          ? "font-semibold text-gray-900"
                          : "font-medium text-gray-600"
                      }`}
                    >
                      {item.patient}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 flex-shrink-0 ml-3 font-normal">
                    {item.time}
                  </span>
                </div>

                {/* Type row */}
                <div className="flex items-center gap-1.5 mb-1.5 ml-[15px]">
                  {!item.read && <div className="w-[7px]" />}
                  <TypeIcon type={item.typeIcon} />
                  <TypeLabel item={item} />
                </div>

                {/* Snippet */}
                <p className="text-[12px] text-gray-400 leading-relaxed line-clamp-2 ml-[15px]">
                  {!item.read && <span className="inline-block w-[7px]" />}
                  {item.snippet}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Detail View (2/3) ───────────── */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-8">
          {/* ── 1. Patient Meta Header ─────────────────── */}
          <div className="py-8 border-b border-gray-100">
            <div className="flex items-start justify-between">
              {/* Left: avatar + info */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight leading-tight">
                    {selected.patient}
                  </h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-gray-500">
                      Age {selected.age}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">
                      {selected.condition}
                    </span>
                    <span className="text-gray-300">·</span>
                    <span className="text-sm text-gray-500">
                      {selected.time}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: badge + actions */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-200">
                  Review Needed
                </span>
                <button
                  id="mark-reviewed-btn"
                  className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-600 flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Reviewed
                </button>
                <button
                  id="schedule-visit-btn"
                  className="px-3.5 py-2 bg-emerald-600 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Schedule Visit
                </button>
              </div>
            </div>
          </div>

          {/* ── 2. Patient Logs (Day-wise Summary) ─────── */}
          <div className="py-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList className="w-4 h-4 text-gray-400" />
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Patient Logs (Day-wise Summary)
              </h3>
            </div>

            <div className="space-y-0">
              {selected.dayLogs.map((log, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-5 py-4 ${
                    idx < selected.dayLogs.length - 1
                      ? "border-b border-gray-50"
                      : ""
                  }`}
                >
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider w-24 flex-shrink-0 pt-0.5">
                    {log.day}
                  </span>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {log.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3. AI Summarized Report ────────────────── */}
          <div className="py-8 border-b border-gray-100">
            <div className="flex items-center gap-2 mb-5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                AI Summarized Report
              </h3>
            </div>

            {/* Summary Card */}
            <div className="bg-emerald-50 border border-emerald-200/60 rounded-xl p-6">
              <p className="text-[15px] text-gray-700 leading-[1.8]">
                {selected.summary.text}
              </p>

              {/* Meta footer */}
              <div className="flex items-center gap-6 mt-5 pt-4 border-t border-emerald-200/40">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] text-gray-500">
                    Confidence:{" "}
                    <span className="font-semibold text-gray-700">
                      {selected.summary.confidence}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] text-gray-500">
                    Risk Level:{" "}
                    <span
                      className={`font-semibold ${
                        selected.summary.riskLevel === "High"
                          ? "text-red-500"
                          : "text-amber-600"
                      }`}
                    >
                      {selected.summary.riskLevel}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3 h-3 text-emerald-600" />
                  <span className="text-[11px] text-gray-500">
                    Based on{" "}
                    <span className="font-semibold text-gray-700">
                      {selected.summary.entries} entries
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* Suggested Actions */}
            <div className="flex flex-wrap gap-2 mt-5">
              {selected.actions.map((action) => (
                <button
                  key={action}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 cursor-pointer"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Direct Patient Instructions ─────────── */}
          <div className="py-8">
            <h3 className="text-sm font-bold text-gray-900 tracking-tight mb-1">
              Direct Patient Instructions
            </h3>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              Send a secure, one-way message to the patient&apos;s dashboard.
        
            </p>

            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <textarea
                id="instruction-input"
                value={instructionText}
                onChange={(e) => setInstructionText(e.target.value)}
                placeholder={`Type instructions or dosage changes for ${selected.patient}...`}
                rows={4}
                className="w-full px-5 py-4 text-sm text-gray-700 placeholder:text-gray-400 resize-none outline-none border-none bg-white leading-relaxed"
              />
              <div className="flex justify-end px-4 py-3 bg-gray-50/50 border-t border-gray-100">
                <button
                  id="send-instruction-btn"
                  className="px-4 py-2 bg-emerald-600 rounded-lg text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send to Patient
                </button>
              </div>
            </div>
          </div>

          {/* Bottom breathing room */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}
