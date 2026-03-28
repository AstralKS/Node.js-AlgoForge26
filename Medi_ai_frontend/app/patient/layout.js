"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross,
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  FileText,
  Settings,
  ChevronLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/lib/auth-context";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/patient" },
  { icon: CalendarDays, label: "Visits", href: "/patient/visits" },
  { icon: MessageSquare, label: "Messages", href: "/patient/messages" },
  { icon: FileText, label: "Health Logs", href: "/patient/health-logs" },
  { icon: Settings, label: "Settings", href: "/patient/settings" },
];

function PatientShell({ children }) {
  const pathname = usePathname();
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Connecting to backend...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="text-center card-static p-8 max-w-md">
          <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <p className="text-xs text-gray-400">
            Make sure the backend is running on localhost:3000
          </p>
        </div>
      </div>
    );
  }

  const userName = user?.name || "Patient";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-64 bg-white border-r border-border flex flex-col flex-shrink-0"
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold text-gray-900">
              MEDI<span className="text-primary">.AI</span>
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center text-white text-sm font-bold">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="patient-active"
                    className="absolute left-0 w-1 h-8 bg-primary rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Back to Home */}
        <div className="p-4 border-t border-border">
          <Link href="/" className="sidebar-link text-gray-400 hover:text-gray-600">
            <ChevronLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function PatientLayout({ children }) {
  return (
    <AuthProvider>
      <PatientShell>{children}</PatientShell>
    </AuthProvider>
  );
}
