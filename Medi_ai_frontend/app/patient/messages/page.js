"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as aiService from "@/lib/services/aiService";

export default function PatientMessagesPage() {
  const { user, patientId } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.name?.split(" ")[0] || "there"}! I'm your MEDI.AI health assistant. You can:\n\n• Describe symptoms and I'll analyze them\n• Ask about your health status\n• Get medication reminders\n• Request a weekly health report\n\nHow can I help you today?`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", content: userMsg, time: now }]);
    setThinking(true);

    try {
      const result = await aiService.analyzeSymptoms(userMsg, patientId);
      let reply = "";
      if (typeof result === "string") {
        reply = result;
      } else if (typeof result === "object") {
        const a = result.analysis || result;
        if (typeof a === "string") {
          reply = a;
        } else {
          const parts = [];
          
          // AI Response Render
          if (a.assessment || a.analysis_notes) parts.push(`**Assessment:** ${a.assessment || a.analysis_notes}`);
          if (a.summary) parts.push(`**Summary:** ${a.summary}`);
          if (a.possible_conditions?.length) parts.push(`**Possible Conditions:** ${a.possible_conditions.join(", ")}`);
          
          const severity = a.severity_assessment || a.overall_severity || a.risk_level;
          if (severity) parts.push(`**Severity/Risk:** ${severity}`);
          
          const urgency = a.urgency || a.is_emergency || a.requires_urgent_attention;
          if (urgency) parts.push(`**Urgency:** ${urgency}`);
          
          const recs = a.recommendations || a.recommended_actions;
          if (recs?.length) parts.push(`**Recommendations:**\n${recs.map((r) => `• ${r}`).join("\n")}`);
          
          if (a.follow_up) parts.push(`**Follow-up:** ${a.follow_up}`);
          
          // AI-Simulated ML Response Render
          if (a.suggested_condition) {
            parts.push(`**Suggested condition:** ${a.suggested_condition}`);
          }
          if (a.matched_symptoms?.length) {
            parts.push(`**Matched symptoms:**\n${a.matched_symptoms.map((s) => `• ${s}`).join("\n")}`);
          }

          reply = parts.length > 0 ? parts.join("\n\n") : JSON.stringify(a, null, 2);
        }
      } else {
        reply = String(result);
      }
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't process that right now. Error: ${err.message}`,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }
    setThinking(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border bg-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">MEDI.AI Health Assistant</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-primary pulse-green" />
              <span className="text-xs text-gray-400">Connected to AI Backend</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-primary-100 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                msg.role === "assistant"
                  ? "bg-white border border-border text-gray-700 rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm"
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
              <span className={`text-xs mt-2 block ${msg.role === "assistant" ? "text-gray-400" : "text-primary-200"}`}>
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
        {thinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-100 text-primary">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-sm">
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
      <div className="p-4 border-t border-border bg-white">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Describe your symptoms or ask a health question..."
            disabled={thinking}
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all disabled:opacity-50"
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
    </div>
  );
}
