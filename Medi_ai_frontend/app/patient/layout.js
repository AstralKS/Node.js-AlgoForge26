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
  LogOut,
  ChevronLeft,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/patient" },
  { icon: CalendarDays, label: "Visits", href: "/patient/visits" },
  { icon: MessageSquare, label: "Messages", href: "/patient/messages" },
  { icon: FileText, label: "Health Logs", href: "/patient/health-logs" },
  { icon: Settings, label: "Settings", href: "/patient/settings" },
];

export default function PatientLayout({ children }) {
  const pathname = usePathname();

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
