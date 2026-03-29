"use client";

import { useState, use, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  AlertCircle,
  Pill,
  FileText,
  CalendarDays,
  Send,
  Trash2,
  HeartPulse,
  Clock,
  Mic,
  MicOff,
  Loader2,
  CheckCircle,
  X,
} from "lucide-react";
import { patients } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

function RecordingModal({ isOpen, onClose, patientId }) {
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
          formPayload.append("patient_id", patientId);

          const AI_URL = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";
          const res = await fetch(`${AI_URL}/api/transcribe`, {
            method: "POST",
            body: formPayload,
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || err.error || err.message || `HTTP ${res.status}`);
          }

          const data = await res.json();
          setTranscript({
            soap: data.patient_friendly_report,
            rawText: data.whisper_raw_transcription
          });
        } catch (err) {
          setTranscriptError(err.message);
        } finally {
          setProcessing(false);
        }
      };

      recorder.start(250);
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
          className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Record Consultation</h2>
                <p className="text-xs text-gray-400">AI will auto-transcribe and generate SOAP notes</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (transcript) window.location.reload();
                onClose();
              }}
              className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {!processing && (
              <button
                type="button"
                onClick={recording ? stopRecording : startRecording}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-medium text-base transition-all ${recording
                  ? "bg-red-50 text-red-600 hover:bg-red-100 animate-pulse border border-red-200"
                  : "bg-gradient-to-r from-primary-50 to-primary-100 text-primary hover:from-primary-100 hover:to-primary-200 border border-primary/20"
                  }`}
              >
                {recording ? (
                  <>
                    <MicOff className="w-6 h-6" />
                    Stop Recording — {formatTime(recordingTime)}
                  </>
                ) : (
                  <>
                    <Mic className="w-6 h-6" />
                    Start Voice Recording
                  </>
                )}
              </button>
            )}

            {processing && (
              <div className="flex flex-col items-center justify-center gap-3 py-6 text-primary">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm font-medium">Processing audio & generating notes...</span>
              </div>
            )}

            {transcriptError && (
              <div className="bg-red-50 text-red-700 text-sm rounded-lg px-4 py-3 border border-red-200">
                ⚠️ {transcriptError}
              </div>
            )}

            {transcript && !processing && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium bg-green-50 p-3 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5" />
                  Notes saved to patient profile successfully!
                </div>

                {transcript.rawText && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Raw Transcript
                    </p>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 max-h-32 overflow-y-auto text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {transcript.rawText}
                    </div>
                  </div>
                )}

                {transcript.soap && Object.keys(transcript.soap).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <Pill className="w-3.5 h-3.5" /> AI Clinical Note (SOAP)
                    </p>
                    <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 space-y-2 text-sm text-gray-700 max-h-48 overflow-y-auto">
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function PatientDetailsPage({ params }) {
  const { id } = use(params);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [chatMessages, setChatMessages] = useState([
    { sender: "doctor", content: "How are you feeling today?" },
    { sender: "patient", content: "Much better, doctor. The new medicine seems to be working." },
    { sender: "doctor", content: "Great to hear! Keep monitoring your vitals and let me know if anything changes." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [showRecordingModal, setShowRecordingModal] = useState(false);

  useEffect(() => {
    async function fetchPatientDetails() {
      try {
        const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
        const res = await fetch(`${BACKEND_URL}/api/auth/patient/${id}/full-profile`);
        if (!res.ok) throw new Error("Failed to fetch patient data");
        const json = await res.json();
        setPatient(json.data);
      } catch (err) {
        console.error(err);
        setError("Patient not found or failed to load data.");
      } finally {
        setLoading(false);
      }
    }
    fetchPatientDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 text-center mt-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-500">Loading full patient profile...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-6 text-center mt-20">
        <p className="text-gray-500">{error || "Patient not found."}</p>
        <Link href="/doctor/patients" className="text-primary mt-4 inline-block no-underline bg-primary-50 px-4 py-2 rounded-lg">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  // const handleSendMessage = () => {
  //   if (!chatInput.trim()) return;
  //   setChatMessages([...chatMessages, { sender: "doctor", content: chatInput }]);
  //   setChatInput("");
  // };

  const patientName = patient.user?.name || patient.name || "Unknown Patient";
  const userInitials = patientName.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <Link
            href="/doctor/patients"
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors no-underline"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-bold text-lg">
              {userInitials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{patientName}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-warning">
                  Monitored
                </span>
                <span className="text-sm text-gray-400">• {patient.current_diagnosis || "Initial Consult"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRecordingModal(true)}
            className="px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Mic className="w-4 h-4" />
            Start Recording
          </button>
          <button className="px-4 py-2.5 bg-red-50 text-danger rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete Patient
          </button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Patient Info Card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Patient Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <User className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-700">{patient.user?.phone || patient.phone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <Mail className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-700">{patient.user?.email || patient.email || "N/A"}</p>
                </div>
              </div>
              <div className="flex flex-col justify-center gap-1 p-3 bg-gray-50 rounded-xl sm:col-span-2">
                <div className="flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-gray-400" />
                  <p className="text-xs text-gray-400">Current Diagnosis / Condition</p>
                </div>
                <p className="text-sm font-medium text-gray-700 pl-6">{patient.current_diagnosis || "N/A"}</p>
              </div>
            </div>
          </motion.div>

          {/* AI Voice Transcriptions Section */}
          {patient.transcriptions?.length > 0 && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1} className="card-static p-6 border-l-4 border-primary">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                AI Consultations & Transcripts
              </h3>
              <div className="space-y-4">
                {patient.transcriptions.map((transcript, idx) => (
                  <div key={idx} className="bg-gray-50 border border-gray-100 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium tracking-wide mb-3">
                      {new Date(transcript.created_at).toLocaleString()}
                    </p>

                    {transcript.soap_json ? (
                      <div className="space-y-3">
                        {Object.entries(transcript.soap_json).map(([key, val]) => {
                          if (!val || val === "N/A") return null;
                          return (
                            <div key={key}>
                              <span className="text-xs uppercase font-bold text-primary mb-1 block">
                                {key}
                              </span>
                              <span className="text-sm text-gray-800 leading-relaxed block pl-2 border-l-2 border-primary/20">
                                {typeof val === 'string' ? val : JSON.stringify(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs uppercase font-bold text-gray-500 mb-1 block">Raw Transcript</span>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-gray-200">
                          {transcript.raw_text || "Processing or unavailable..."}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Symptoms */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Symptoms History
            </h3>
            <div className="flex flex-col gap-2">
              {patient.symptoms?.length > 0 ? (
                patient.symptoms.map((symptom, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-800">{symptom.description}</span>
                    <span className="text-xs text-gray-500">{new Date(symptom.date || symptom.created_at).toLocaleDateString()}</span>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No symptoms recorded.</span>
              )}
            </div>
          </motion.div>

          {/* Medicines */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Pill className="w-5 h-5 text-primary" />
              Medications
            </h3>
            <div className="space-y-2">
              {patient.medications?.length > 0 ? (
                patient.medications.map((med, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-primary-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Pill className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{med.name || med}</p>
                        {med.dosage && <p className="text-xs text-gray-500">{med.dosage} - {med.frequency}</p>}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No active medicines.</span>
              )}
            </div>
          </motion.div>

          {/* Visit History */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4} className="card-static p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-500" />
              Visit History
            </h3>
            <div className="space-y-3">
              {patient.visits?.length > 0 ? (
                patient.visits.map((visit, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 rounded-xl border-l-4 border-primary">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-700">{new Date(visit.date).toLocaleDateString()}</span>
                      </div>
                      {visit.follow_up_date && (
                        <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded">
                          Follow-up: {new Date(visit.follow_up_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {visit.notes && <p className="text-sm text-gray-600 border-t border-gray-200 pt-2 mt-2">{visit.notes}</p>}
                  </div>
                ))
              ) : (
                <span className="text-sm text-gray-400 italic">No previous visits.</span>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column - Chat */}
        {/* <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="card-static flex flex-col h-fit lg:sticky lg:top-6"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-gray-900">Chat with Patient</h3>
            <p className="text-xs text-gray-400">Send messages directly</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[400px]">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === "doctor" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.sender === "doctor"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-gray-100 text-gray-700 rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all"
              />
              <button
                onClick={handleSendMessage}
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </motion.div> */}
      </div>

      <RecordingModal
        isOpen={showRecordingModal}
        onClose={() => setShowRecordingModal(false)}
        patientId={id}
      />
    </div>
  );
}
