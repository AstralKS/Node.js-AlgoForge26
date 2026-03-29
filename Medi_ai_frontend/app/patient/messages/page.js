"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import * as aiService from "@/lib/services/aiService";

const AI_BOT_USER_ID = "00000000-0000-0000-0000-000000000001";

export default function PatientMessagesPage() {
  const { user, patientId } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      loadHistory();
    }
  }, [user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await aiService.getAIChatHistory(user.id);
      const formatted = history.map((m) => ({
        role: m.sender_id === AI_BOT_USER_ID ? "assistant" : "user",
        content: m.content,
        time: new Date(m.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));

      if (formatted.length === 0) {
        setMessages([
          {
            role: "assistant",
            content: `Hello ${
              user?.name?.split(" ")[0] || "there"
            }! I'm your MEDI.AI health assistant. Describe how you're feeling, and I'll help coordinate your care.`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } else {
        setMessages(formatted);
      }
    } catch (err) {
      console.error("Failed to load history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || thinking) return;
    const userMsg = input.trim();
    setInput("");
    const now = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, time: now },
    ]);
    setThinking(true);

    try {
      const result = await aiService.chatWithAI(userMsg, patientId, user.id);
      const reply = result.reply || "I'm sorry, I couldn't process that.";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: reply,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry, I couldn't process that right now. Please try again later.`,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }
    setThinking(false);
  };

  if (loadingHistory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm">Loading chat history...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 border-b border-border bg-white shadow-sm z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-none mb-1">Health Coordinator</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Gemini AI Live</span>
              </div>
            </div>
          </div>
          <button 
            onClick={loadHistory}
            className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
            title="Refresh History"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === "assistant"
                  ? "bg-white text-primary border border-primary/10"
                  : "bg-primary text-white"
              }`}
            >
              {msg.role === "assistant" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>
            <div
              className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-2xl text-sm shadow-sm ${
                msg.role === "assistant"
                  ? "bg-white border border-border text-gray-700 rounded-tl-sm"
                  : "bg-white border border-primary/20 text-gray-900 rounded-tr-sm ring-1 ring-primary/5"
              }`}
            >
              <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>
              <div className={`text-[10px] mt-2 font-medium ${msg.role === "assistant" ? "text-gray-300" : "text-primary/40"}`}>
                {msg.time}
              </div>
            </div>
          </motion.div>
        ))}
        {thinking && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-primary/10 text-primary shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-border p-4 rounded-2xl rounded-tl-sm shadow-sm">
              <div className="flex gap-1.5">
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary/40 rounded-full" />
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 md:p-6 border-t border-border bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/5 transition-all">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your health update..."
            disabled={thinking}
            className="flex-1 bg-transparent px-4 py-3 text-sm focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={thinking || !input.trim()}
            className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-40 disabled:shadow-none"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3 uppercase font-bold tracking-widest opacity-60">
          AI coordinator can monitor symptoms but does not provide diagnosis
        </p>
      </div>
    </div>
  );
}
