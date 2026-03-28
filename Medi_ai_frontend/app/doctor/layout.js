"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Cross,
  LayoutDashboard,
  Users,
  MessageSquare,
  Settings,
  ChevronLeft,
  Stethoscope,
} from "lucide-react";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/doctor" },
  { icon: Users, label: "Patients", href: "/doctor/patients" },
  { icon: MessageSquare, label: "Messages", href: "/doctor/messages" },
  { icon: Settings, label: "Settings", href: "/doctor/settings" },
];

export default function DoctorLayout({ children }) {
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

        {/* Doctor Info */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Dr. Amit Patel</p>
              <p className="text-xs text-gray-400">Cardiologist</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/doctor"
                ? pathname === "/doctor"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
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
