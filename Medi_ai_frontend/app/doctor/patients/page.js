"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Plus,
  Eye,
  Trash2,
  X,
  UserPlus,
  Mic,
  MicOff,
  Calendar,
  FileText,
  Pill,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { patients as initialPatients } from "@/lib/data";

const AI_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

function AddPatientModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    symptoms: "",
    medicines: "",
    nextVisit: "",
    notes: "",
  });

  // ── Recording state ──
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcript, setTranscript] = useState(null);
  const [transcriptError, setTranscriptError] = useState(null);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const timerRef = useRef(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      setTranscript(null);
      setTranscriptError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Pick the best supported format — AssemblyAI accepts webm/ogg/mp4/wav
      const mimeType = [
        "audio/wav",
        "audio/ogg;codecs=opus",
        "audio/ogg",
        "audio/webm;codecs=opus",
        "audio/webm",
      ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const ext = mimeType.includes("ogg") ? "ogg" : mimeType.includes("wav") ? "wav" : "webm";
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      audioChunks.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setProcessing(true);
        try {
          const blob = new Blob(audioChunks.current, { type: mimeType || "audio/webm" });
          const formPayload = new FormData();
          formPayload.append("file", blob, `recording.${ext}`);

          const res = await fetch(`${AI_URL}/api/transcribe`, {
            method: "POST",
            body: formPayload,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || `HTTP ${res.status}`);
          }

          const data = await res.json();
          const soap = data.patient_friendly_report || {};
          const rawText = data.whisper_raw_transcription || "";

          // Auto-fill form fields from SOAP note
          setTranscript({ soap, rawText });
          if (soap.subjective) {
            setFormData((prev) => ({
              ...prev,
              symptoms: soap.subjective,
              notes: (prev.notes ? prev.notes + "\n\n" : "") +
                (soap.assessment ? `Assessment: ${soap.assessment}` : "") +
                (soap.plan ? `\nPlan: ${soap.plan}` : ""),
            }));
          } else if (rawText) {
            setFormData((prev) => ({ ...prev, symptoms: rawText }));
          }
        } catch (err) {
          setTranscriptError(err.message);
        } finally {
          setProcessing(false);
        }
      };

      recorder.start(250); // collect in 250ms chunks
      mediaRecorder.current = recorder;
      setRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000);
    } catch (err) {
      setTranscriptError("Microphone access denied: " + err.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add New Patient</h2>
                <p className="text-xs text-gray-400">Fill in patient details or record a consultation</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Patient Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter patient's full name"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Symptoms
              </label>
              <textarea
                value={formData.symptoms}
                onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                placeholder="Describe symptoms..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <Pill className="w-4 h-4 inline mr-1" />
                Medicines Given
              </label>
              <input
                type="text"
                value={formData.medicines}
                onChange={(e) => setFormData({ ...formData, medicines: e.target.value })}
                placeholder="e.g. Metformin 500mg, Aspirin 75mg"
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <Calendar className="w-4 h-4 inline mr-1" />
                Next Visit Date
              </label>
              <input
                type="date"
                value={formData.nextVisit}
                onChange={(e) => setFormData({ ...formData, nextVisit: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                <FileText className="w-4 h-4 inline mr-1" />
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
                className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all resize-none"
              />
            </div>

            {/* ── Voice Recording Section ── */}
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="p-3 bg-primary-50 flex items-center gap-2 border-b border-border">
                <Mic className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">Consultation Recorder</span>
                <span className="ml-auto text-xs text-gray-400">AI auto-fills from voice</span>
              </div>

              <div className="p-4 space-y-3">
                {/* Recording Button */}
                {!processing && (
                  <button
                    type="button"
                    onClick={recording ? stopRecording : startRecording}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${
                      recording
                        ? "bg-red-50 text-red-600 hover:bg-red-100 animate-pulse"
                        : "bg-gradient-to-r from-primary-50 to-primary-100 text-primary hover:from-primary-100 hover:to-primary-200"
                    }`}
                  >
                    {recording ? (
                      <>
                        <MicOff className="w-5 h-5" />
                        Stop Recording — {formatTime(recordingTime)}
                      </>
                    ) : (
                      <>
                        <Mic className="w-5 h-5" />
                        Start Voice Recording
                      </>
                    )}
                  </button>
                )}

                {/* Processing State */}
                {processing && (
                  <div className="flex items-center justify-center gap-3 py-3 text-primary">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">Transcribing with AssemblyAI…</span>
                  </div>
                )}

                {/* Error */}
                {transcriptError && (
                  <div className="bg-red-50 text-red-700 text-sm rounded-lg px-3 py-2">
                    ⚠️ {transcriptError}
                  </div>
                )}

                {/* Success / Transcript + SOAP Preview */}
                {transcript && !processing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    {/* Success banner */}
                    <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Transcription complete — form auto-filled!
                    </div>

                    {/* Raw transcript */}
                    {transcript.rawText && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          📝 Raw Transcript
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 max-h-36 overflow-y-auto text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {transcript.rawText}
                        </div>
                      </div>
                    )}

                    {/* SOAP Note */}
                    {transcript.soap && Object.keys(transcript.soap).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                          🩺 AI Clinical Note (SOAP)
                        </p>
                        <div className="bg-gray-50 border border-border rounded-xl p-3 space-y-1.5 text-xs text-gray-700 max-h-48 overflow-y-auto">
                          {Object.entries(transcript.soap).map(([k, v]) =>
                            v ? (
                              <div key={k}>
                                <span className="font-semibold capitalize text-primary">{k}:</span>{" "}
                                {typeof v === "string" ? v : JSON.stringify(v)}
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button onClick={onClose} className="btn-primary text-sm py-2.5 px-6">
              <Plus className="w-4 h-4" />
              Add Patient
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [patientsList, setPatientsList] = useState(initialPatients);
  const [showModal, setShowModal] = useState(false);

  const filteredPatients = patientsList.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const deletePatient = (id) => {
    setPatientsList(patientsList.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-500">Manage and monitor your patients</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative mb-6"
      >
        <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search patients by name..."
          className="w-full pl-12 pr-4 py-3 bg-white rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
        />
      </motion.div>

      {/* Patient List */}
      <div className="space-y-3">
        {filteredPatients.map((patient, idx) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-bold">
                  {patient.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-sm text-gray-400">
                      Age: {patient.age}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-400">
                      {patient.condition}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                    patient.risk === "high"
                      ? "bg-red-50 text-danger"
                      : patient.risk === "moderate"
                      ? "bg-amber-50 text-warning"
                      : "bg-primary-50 text-primary"
                  }`}
                >
                  {patient.risk === "high"
                    ? "High Risk"
                    : patient.risk === "moderate"
                    ? "Moderate"
                    : "Stable"}
                </span>
                <span className="text-sm text-gray-400">
                  Last visit: {patient.lastVisit}
                </span>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/doctor/patients/${patient.id}`}
                    className="px-4 py-2 bg-primary-50 text-primary rounded-lg text-sm font-medium hover:bg-primary-100 transition-colors flex items-center gap-1.5 no-underline"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  <button
                    onClick={() => deletePatient(patient.id)}
                    className="px-4 py-2 bg-red-50 text-danger rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No patients found matching your search</p>
          </div>
        )}
      </div>

      <AddPatientModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
