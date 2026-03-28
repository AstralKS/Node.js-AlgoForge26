"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Phone,
  Video,
  MoreVertical,
  Shield,
  Calendar,
  FileText,
  HeartPulse,
  Sparkles,
  ArrowLeft,
  Star,
} from "lucide-react";

/* ── Conversation Data ─────────────────────────────────────── */
const conversations = [
  {
    id: 1,
    doctor: "Dr. Amit Patel",
    specialty: "Endocrinologist",
    avatar: "AP",
    avatarBg: "bg-purple-100 text-purple-600",
    online: true,
    lastMessage: "Yes, continue with Metformin...",
    lastTime: "10:40 AM",
    unread: 0,
    pinned: true,
    messages: [
      {
        id: 1,
        time: "10:15 AM",
        date: "Today",
        content:
          "Good morning! I've reviewed your latest blood work results. Everything is looking much better compared to last month.",
      },
      {
        id: 2,
        time: "10:18 AM",
        date: "Today",
        content:
          "Your HbA1c has dropped from 7.2% to 6.8% — that's excellent progress. The dietary changes are clearly working.",
      },
      {
        id: 3,
        time: "10:30 AM",
        date: "Today",
        content:
          "Continue with Metformin 500mg twice daily. I'd also like you to keep monitoring your fasting blood sugar every morning.",
      },
      {
        id: 4,
        time: "10:40 AM",
        date: "Today",
        content:
          "We'll review again in 2 weeks. If you feel any unusual symptoms, don't hesitate to reach out through the AI assistant.",
      },
    ],
  },
  {
    id: 2,
    doctor: "Dr. Sneha Reddy",
    specialty: "Cardiologist",
    avatar: "SR",
    avatarBg: "bg-purple-500 text-white",
    online: false,
    lastMessage: "Your ECG report is attached...",
    lastTime: "Yesterday",
    unread: 2,
    pinned: false,
    messages: [
      {
        id: 1,
        time: "3:00 PM",
        date: "Yesterday",
        content:
          "Hello! I've gone through your latest ECG readings. There are a few observations I'd like to share with you.",
      },
      {
        id: 2,
        time: "3:05 PM",
        date: "Yesterday",
        content:
          "Your ECG report is attached. Please review and let me know if you have questions through the AI assistant. We may need to adjust your heart medication.",
      },
    ],
  },
  {
    id: 3,
    doctor: "Dr. Ravi Kumar",
    specialty: "General Physician",
    avatar: "RK",
    avatarBg: "bg-orange-500 text-white",
    online: true,
    lastMessage: "Your annual checkup is due...",
    lastTime: "Mon",
    unread: 1,
    pinned: false,
    messages: [
      {
        id: 1,
        time: "11:00 AM",
        date: "Monday",
        content:
          "Hi! Just a friendly reminder — your annual health checkup is due next week. Please book a convenient slot through the dashboard.",
      },
    ],
  },
];

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function PatientMessagesPage() {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  const selected =
    conversations.find((c) => c.id === selectedId) || conversations[0];

  const filtered = conversations.filter((c) =>
    c.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pinnedItems = filtered.filter((c) => c.pinned);
  const allItems = filtered.filter((c) => !c.pinned);

  const handleSelect = (conv) => {
    setSelectedId(conv.id);
    setShowMobileChat(true);
  };

  return (
    <div className="flex h-full bg-white">
      {/* ── LEFT COLUMN: Conversations List ───────────── */}
      <div
        className={`w-full lg:w-[380px] bg-white flex flex-col flex-shrink-0 border-r border-gray-100 ${
          showMobileChat ? "hidden lg:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-xl font-medium text-gray-900">Messages</h1>
            <button
              id="filter-btn"
              className="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-gray-400 cursor-pointer"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="search-conversations"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 rounded-lg text-sm border-none outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {/* Pinned */}
          {pinnedItems.length > 0 && (
            <>
              <div className="px-6 pt-3 pb-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  Pinned
                </span>
              </div>
              {pinnedItems.map((conv) => (
                <ConversationRow
                  key={conv.id}
                  conv={conv}
                  isActive={selectedId === conv.id}
                  onClick={() => handleSelect(conv)}
                />
              ))}
            </>
          )}

          {/* All Messages */}
          <div className="px-6 pt-5 pb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              All Messages
            </span>
          </div>
          {allItems.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              isActive={selectedId === conv.id}
              onClick={() => handleSelect(conv)}
            />
          ))}
        </div>
      </div>

      {/* ── RIGHT COLUMN: Detail View ─────────────────── */}
      <div
        className={`flex-1 flex flex-col bg-white ${
          showMobileChat ? "flex" : "hidden lg:flex"
        }`}
      >
        {/* ── 1. Header ────────────────────────────────── */}
        <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile back */}
            <button
              id="back-btn"
              onClick={() => setShowMobileChat(false)}
              className="lg:hidden w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-purple-600">
                {selected.avatar}
              </span>
            </div>

            <div>
              <h2 className="text-[15px] font-medium text-gray-900">
                {selected.doctor}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-500">
                  {selected.specialty}
                </span>
                <span className="text-gray-300">·</span>
                {selected.online ? (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-emerald-600 font-medium">
                      Online
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Offline</span>
                )}
              </div>
            </div>
          </div>

          {/* <div className="flex items-center gap-1">
            <button
              id="phone-btn"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer"
            >
              <Phone className="w-[18px] h-[18px]" />
            </button>
            <button
              id="video-btn"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer"
            >
              <Video className="w-[18px] h-[18px]" />
            </button>
            <button
              id="menu-btn"
              className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-400 cursor-pointer"
            >
              <MoreVertical className="w-[18px] h-[18px]" />
            </button>
          </div> */}
        </div>

        {/* HIPAA Banner */}
        <div className="flex items-center justify-center py-2.5 bg-emerald-50/60 border-b border-emerald-100/50">
          <Shield className="w-3 h-3 text-emerald-600 mr-1.5" />
          <span className="text-[11px] text-emerald-600/70 font-medium">
            Messages are end-to-end encrypted &amp; HIPAA compliant
          </span>
        </div>

        {/* ── 2. Message Feed ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6 max-w-3xl">
            {/* Date separator */}
            <div className="flex items-center justify-center mb-8">
              <div className="px-3 py-1 bg-gray-50 rounded-full">
                <span className="text-[11px] font-medium text-gray-400">
                  {selected.messages[0]?.date || "Today"}
                </span>
              </div>
            </div>

            {/* Doctor messages as clean flat cards */}
            <div className="space-y-4">
              {selected.messages.map((msg) => (
                <div key={msg.id} className="space-y-1.5">
                  <div className="bg-gray-50 rounded-xl px-5 py-4">
                    <p className="text-sm text-gray-700 leading-[1.75]">
                      {msg.content}
                    </p>
                  </div>
                  <span className="text-[10px] text-gray-400 pl-1 block">
                    {msg.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            {/* <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-gray-50">
              {[
                { icon: Calendar, label: "Book Appointment" },
                { icon: FileText, label: "Share Reports" },
                { icon: HeartPulse, label: "Share Vitals" },
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-500 cursor-pointer"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div> */}
          </div>
        </div>

        {/* ── 3. Bottom: Ask AI Bridge ─────────────────── */}
        <div className="px-8 pt-5 pb-6 border-t border-gray-100">
          <button
            id="ask-ai-btn"
            onClick={() => router.push("/patient?askAI=true")}
            className="w-full py-4 bg-emerald-600 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2.5 cursor-pointer"
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
