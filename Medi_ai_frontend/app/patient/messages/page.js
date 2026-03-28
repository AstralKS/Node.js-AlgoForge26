"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Send, HeartPulse, User, Paperclip } from "lucide-react";
import { patientMessages } from "@/lib/data";

export default function PatientMessagesPage() {
  const [messages, setMessages] = useState(patientMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        sender: "You",
        content: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isDoctor: false,
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border bg-white"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Dr. Amit Patel</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search messages..."
              className="pl-9 pr-4 py-2 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary transition-all w-64"
            />
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
            transition={{ delay: idx * 0.1 }}
            className={`flex gap-3 ${msg.isDoctor ? "" : "flex-row-reverse"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.isDoctor
                  ? "bg-primary-100 text-primary"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {msg.isDoctor ? (
                <HeartPulse className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div
              className={`max-w-[70%] p-4 rounded-2xl text-sm ${
                msg.isDoctor
                  ? "bg-white border border-border text-gray-700 rounded-tl-sm"
                  : "bg-primary text-white rounded-tr-sm"
              }`}
            >
              <p>{msg.content}</p>
              <span
                className={`text-xs mt-2 block ${
                  msg.isDoctor ? "text-gray-400" : "text-primary-200"
                }`}
              >
                {msg.time}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border bg-white">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
            <Paperclip className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-dark transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            If any doubts, Ask AI
          </button>
          <p className="text-center text-xs text-gray-500 mt-3 leading-relaxed">
            Direct replies to the doctor are disabled. Click above to discuss
            these instructions with your AI Healthcare Companion.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Conversation Row Component ────────────────────────────── */
function ConversationRow({ conv, isActive, onClick }) {
  return (
    <button
      id={`conversation-${conv.id}`}
      onClick={onClick}
      className={`w-full text-left px-6 py-4 border-b border-gray-50 cursor-pointer relative ${
        isActive ? "bg-white" : "bg-white"
      }`}
    >
      {/* Active left border */}
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-emerald-600 rounded-r-sm" />
      )}

      <div className="flex items-start gap-3.5">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-11 h-11 rounded-xl ${conv.avatarBg} flex items-center justify-center`}
          >
            <span className="text-sm font-bold">{conv.avatar}</span>
          </div>
          {conv.online && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <h4
              className={`text-[14px] truncate ${
                conv.unread > 0
                  ? "font-semibold text-gray-900"
                  : "font-medium text-gray-700"
              }`}
            >
              {conv.doctor}
            </h4>
            <span
              className={`text-[11px] flex-shrink-0 ml-2 ${
                conv.unread > 0
                  ? "text-emerald-600 font-semibold"
                  : "text-gray-400"
              }`}
            >
              {conv.lastTime}
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-1">{conv.specialty}</p>
          <div className="flex items-center justify-between">
            <p
              className={`text-[13px] truncate leading-snug ${
                conv.unread > 0 ? "text-gray-600 font-medium" : "text-gray-400"
              }`}
            >
              {conv.lastMessage}
            </p>
            {conv.unread > 0 && (
              <span className="ml-2 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center">
                <span className="text-[10px] font-bold text-white">
                  {conv.unread}
                </span>
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}
