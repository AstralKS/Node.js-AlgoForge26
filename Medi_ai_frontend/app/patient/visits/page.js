"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  FileText,
  Loader2,
  Plus,
  X,
  AlertCircle,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getPatientProfile } from "@/lib/services/authService";
import * as visitService from "@/lib/services/visitService";

export default function VisitsPage() {
  const { patientId } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: "", notes: "", follow_up_date: "" });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!patientId) return;
    async function fetchData() {
      try {
        const profile = await getPatientProfile(patientId);
        const manualVisits = (profile.visits || []).map(v => ({ ...v, type: 'visit' }));
        const aiVisits = (profile.transcriptions || []).map(t => ({
          ...t,
          type: 'ai_consultation',
          date: t.created_at,
          notes: t.raw_text
        }));

        const merged = [...manualVisits, ...aiVisits].sort((a, b) =>
          new Date(b.date || b.created_at) - new Date(a.date || a.created_at)
        );
        setTimeline(merged);
      } catch (err) {
        console.error("Failed to fetch visits:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [patientId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await visitService.createVisit({
        patient_id: patientId,
        date: form.date || new Date().toISOString(),
        notes: form.notes || null,
        follow_up_date: form.follow_up_date || null,
      });
      setTimeline((prev) => [{ ...result, type: 'visit' }, ...prev]);
      setShowModal(false);
      setForm({ date: "", notes: "", follow_up_date: "" });
    } catch (err) {
      console.error("Add visit failed:", err);
    }
    setSubmitting(false);
  };

  const isUpcoming = (date) => new Date(date) > new Date();

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-gray-400">Loading your history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Clinical Visits</h1>
          <p className="text-gray-500">Manual visits and AI-recorded consultations.</p>
        </div>
        {/* <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="w-4 h-4" /> Add Past Visit
        </button> */}
      </motion.div>

      {timeline.length === 0 ? (
        <div className="card p-12 text-center bg-gray-50/50 border-dashed border-2">
          <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
          <h3 className="font-semibold text-gray-900 mb-1">No history found</h3>
          <p className="text-gray-400 text-sm">You don't have any manual visits or AI consultations yet.</p>
        </div>
      ) : (
        <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {timeline.map((item, idx) => {
            const date = new Date(item.date || item.created_at);
            const upcoming = isUpcoming(date);
            const isAI = item.type === 'ai_consultation';
            const id = item.id || idx;

            return (
              <motion.div
                key={id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="relative pl-12"
              >
                {/* Dot */}
                <div className={`absolute left-[14px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 ${upcoming ? "bg-blue-500" : isAI ? "bg-primary" : "bg-gray-400"}`} />

                <div className={`card overflow-hidden transition-all duration-300 ${expandedId === id ? "ring-2 ring-primary/20" : "hover:shadow-md"}`}>
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => isAI && setExpandedId(expandedId === id ? null : id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAI ? "bg-primary-100 text-primary" : upcoming ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}>
                          {isAI ? <MessageSquare className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 line-height-1">
                              {date.toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                            </h3>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider ${isAI ? "bg-primary-50 text-primary" : upcoming ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                              {isAI ? "AI Consultation" : upcoming ? "Upcoming" : "Manual Log"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            {date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                      {isAI && (
                        <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedId === id ? "rotate-180" : ""}`} />
                      )}
                    </div>

                    {item.notes && !isAI && (
                      <div className="flex items-start gap-3 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                        <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-600 leading-relaxed">{item.notes}</p>
                      </div>
                    )}

                    {isAI && !expandedId === id && (
                      <p className="text-sm text-gray-400 italic">Click to view consultation summary</p>
                    )}

                    <AnimatePresence>
                      {expandedId === id && isAI && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="mt-4 pt-4 border-t border-gray-100 space-y-4"
                        >
                          {item.soap_json ? (
                            <div className="grid sm:grid-cols-2 gap-4">
                              {Object.entries(item.soap_json).map(([key, val]) => {
                                if (!val || val === "N/A") return null;
                                return (
                                  <div key={key} className="bg-gray-50 p-3 rounded-xl">
                                    <span className="text-[10px] uppercase font-bold text-primary mb-1 block">
                                      {key}
                                    </span>
                                    <p className="text-sm text-gray-700">{typeof val === 'string' ? val : JSON.stringify(val)}</p>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <span className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Full Transcript</span>
                              <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.raw_text || "No transcript available."}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {item.follow_up_date && (
                      <div className="mt-4 flex items-center gap-2 text-xs font-medium text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        Follow-up scheduled for: {new Date(item.follow_up_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Visit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Add Visit Record</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Date & Time</label>
                  <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Clinical Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="What was discussed..." rows={4} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all resize-none" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-1.5">Follow-up Date (optional)</label>
                  <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-all" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center py-3.5 mt-2">
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save to History"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
