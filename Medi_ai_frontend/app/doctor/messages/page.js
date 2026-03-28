"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Send,
  Paperclip,
  User,
  Stethoscope,
  Phone,
  Video,
  MoreVertical,
  Check,
  CheckCheck,
  Image as ImageIcon,
} from "lucide-react";
import { doctorMessages } from "@/lib/data";

const chatHistories = {
  1: [
    { sender: "patient", content: "Good morning, Doctor. I wanted to update you on my blood sugar levels.", time: "9:00 AM", status: "read" },
    { sender: "doctor", content: "Good morning, Aarav! Please share your recent readings.", time: "9:05 AM", status: "read" },
    { sender: "patient", content: "Fasting: 140 mg/dL, Post-meal: 195 mg/dL. Is this concerning?", time: "9:08 AM", status: "read" },
    { sender: "doctor", content: "Your fasting levels are slightly high. Let's adjust your Metformin dosage. I'm increasing it to 750mg. Also, please follow the diet plan I shared.", time: "9:15 AM", status: "read" },
    { sender: "patient", content: "Thank you doctor, I'll follow the diet plan.", time: "9:20 AM", status: "read" },
  ],
  2: [
    { sender: "patient", content: "Hi Doctor, my BP readings have been normal this week.", time: "10:00 AM", status: "read" },
    { sender: "doctor", content: "That's excellent news, Priya! What were the exact readings?", time: "10:05 AM", status: "read" },
    { sender: "patient", content: "Morning: 125/82, Evening: 130/85. Is this good?", time: "10:10 AM", status: "read" },
    { sender: "doctor", content: "Yes, those are within acceptable range. Continue your current medication. Let's check again next week.", time: "10:15 AM", status: "read" },
  ],
  3: [
    { sender: "patient", content: "Doctor, I felt palpitations again last night.", time: "7:00 PM", status: "read" },
    { sender: "doctor", content: "I'm sorry to hear that, Rahul. How long did the episode last?", time: "7:05 PM", status: "read" },
    { sender: "patient", content: "About 15 minutes. It happened around 11 PM while lying down.", time: "7:10 PM", status: "read" },
    { sender: "doctor", content: "Please come in for an ECG tomorrow morning. Avoid caffeine and heavy meals before bed. If it happens again, please call emergency.", time: "7:15 PM", status: "delivered" },
  ],
  4: [
    { sender: "patient", content: "Hi Doctor, the new inhaler is working better. I can breathe more easily now.", time: "2:00 PM", status: "read" },
    { sender: "doctor", content: "Great to hear, Sneha! Any side effects like shaking hands or increased heart rate?", time: "2:10 PM", status: "read" },
    { sender: "patient", content: "No side effects at all. Should I continue with the same dosage?", time: "2:15 PM", status: "read" },
    { sender: "doctor", content: "Yes, continue the current dosage. Use the rescue inhaler only when needed. Schedule a follow-up in 2 weeks.", time: "2:20 PM", status: "delivered" },
  ],
};

export default function DoctorMessagesPage() {
  const [selectedChat, setSelectedChat] = useState(doctorMessages[0]);
  const [messages, setMessages] = useState(chatHistories[1]);
  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = doctorMessages.filter((msg) =>
    msg.patient.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
    setMessages(chatHistories[chat.id] || []);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([
      ...messages,
      {
        sender: "doctor",
        content: input,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: "sent",
      },
    ]);
    setInput("");
  };

  return (
    <div className="flex h-full">
      {/* Contact List Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-80 bg-white border-r border-border flex flex-col flex-shrink-0"
      >
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Messages</h2>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search patients..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-border focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.map((contact) => (
            <button
              key={contact.id}
              onClick={() => handleSelectChat(contact)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-primary-50 transition-colors text-left border-b border-border/50 ${
                selectedChat?.id === contact.id ? "bg-primary-50" : ""
              }`}
            >
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-semibold text-sm">
                  {contact.avatar}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-gray-900 truncate">
                    {contact.patient}
                  </h4>
                  <span className="text-xs text-gray-400 flex-shrink-0">
                    {contact.time}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {contact.lastMessage}
                </p>
              </div>
              {contact.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-medium flex-shrink-0">
                  {contact.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-b border-border bg-white flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-primary font-semibold text-sm">
              {selectedChat?.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {selectedChat?.patient}
              </h3>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-gray-400">Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
              <Phone className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
              <Video className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-surface">
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`flex gap-2.5 ${
                  msg.sender === "doctor" ? "flex-row-reverse" : ""
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.sender === "doctor"
                      ? "bg-primary-100 text-primary"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {msg.sender === "doctor" ? (
                    <Stethoscope className="w-3.5 h-3.5" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                </div>
                <div
                  className={`max-w-[65%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "doctor"
                      ? "bg-primary text-white rounded-tr-sm"
                      : "bg-white border border-border text-gray-700 rounded-tl-sm shadow-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <div
                    className={`flex items-center gap-1 mt-1.5 ${
                      msg.sender === "doctor"
                        ? "text-primary-200 justify-end"
                        : "text-gray-400"
                    }`}
                  >
                    <span className="text-xs">{msg.time}</span>
                    {msg.sender === "doctor" && (
                      msg.status === "read" ? (
                        <CheckCheck className="w-3.5 h-3.5" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-white">
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary-50 transition-all">
              <ImageIcon className="w-5 h-5" />
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
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
