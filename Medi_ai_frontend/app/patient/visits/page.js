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
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as visitService from "@/lib/services/visitService";

export default function VisitsPage() {
  const { patientId } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: "", notes: "", follow_up_date: "" });

  useEffect(() => {
    if (!patientId) return;
    visitService
      .getVisitsByPatient(patientId)
      .then((data) => setVisits(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
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
      setVisits((prev) => [result, ...prev]);
      setShowModal(false);
      setForm({ date: "", notes: "", follow_up_date: "" });
    } catch {}
    setSubmitting(false);
  };

  const isUpcoming = (date) => new Date(date) > new Date();

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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Visits</h1>
          <p className="text-gray-500">View your past and upcoming appointments</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary text-sm py-2.5 px-4">
          <Plus className="w-4 h-4" /> Add Visit
        </button>
      </motion.div>

      {visits.length === 0 ? (
        <div className="card p-8 text-center">
          <AlertCircle className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-400">No visits recorded yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit, idx) => {
            const upcoming = isUpcoming(visit.date);
            return (
              <motion.div
                key={visit.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card p-5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${upcoming ? "bg-blue-100 text-blue-600" : "bg-primary-100 text-primary"}`}>
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {new Date(visit.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(visit.date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${upcoming ? "bg-blue-50 text-blue-600" : "bg-primary-50 text-primary"}`}>
                    {upcoming ? "Upcoming" : "Completed"}
                  </span>
                </div>
                {visit.notes && (
                  <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-xl">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600">{visit.notes}</p>
                  </div>
                )}
                {visit.follow_up_date && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    Follow-up: {new Date(visit.follow_up_date).toLocaleDateString()}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add Visit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Add Visit</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Date & Time</label>
                  <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Notes</label>
                  <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Visit notes..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all resize-none" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Follow-up Date (optional)</label>
                  <input type="date" value={form.follow_up_date} onChange={(e) => setForm({ ...form, follow_up_date: e.target.value })} className="w-full px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all" />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Visit"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
