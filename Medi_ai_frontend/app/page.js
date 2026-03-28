"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Cross,
  Activity,
  Shield,
  Brain,
  HeartPulse,
  Stethoscope,
  ArrowRight,
  ChevronRight,
  Users,
  BarChart3,
  MessageSquare,
  Mic,
  Star,
  CheckCircle2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.12 } },
};

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
            <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900">
            MEDI<span className="text-primary">.AI</span>
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Features", "About"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors no-underline"
            >
              {item}
            </a>
          ))}
          <Link href="/patient" className="btn-primary text-sm py-2.5 px-5 no-underline">
            Get Started
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

function HeroSection() {
  return (
    <section className="hero-gradient min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      {/* Decorative blobs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-50/50 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
          >
            <HeartPulse className="w-4 h-4" />
            AI-Powered Healthcare Platform
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-tight mb-6"
          >
            AI-powered continuous{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              healthcare
            </span>{" "}
            monitoring
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Track symptoms, detect risks early, and stay connected with your
            doctor — all powered by intelligent AI insights.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/patient" className="btn-primary text-base py-3.5 px-8 no-underline">
              Patient Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/doctor" className="btn-outline text-base py-3.5 px-8 no-underline">
              <Stethoscope className="w-5 h-5" />
              Doctor Dashboard
            </Link>
          </motion.div>

          {/* Stats
          <motion.div
            variants={fadeUp}
            custom={4}
            className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          >
            {[
              { num: "10K+", label: "Active Patients" },
              { num: "500+", label: "Doctors" },
              { num: "99.9%", label: "Uptime" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-gray-900">{stat.num}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: "AI Health Analysis",
      desc: "Advanced AI models analyze your health data to detect risks before they become serious.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: Activity,
      title: "Real-time Monitoring",
      desc: "Continuous tracking of vital signs with instant alerts for any anomalies detected.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "HIPAA-compliant data protection ensuring your health records remain confidential.",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: MessageSquare,
      title: "Doctor Connect",
      desc: "Instant messaging and video consultations with your healthcare providers.",
      color: "from-cyan-500 to-blue-500",
    },
    {
      icon: Mic,
      title: "Voice Input",
      desc: "Log symptoms and health data using natural voice commands powered by AI.",
      color: "from-green-500 to-lime-500",
    },
    {
      icon: BarChart3,
      title: "Health Analytics",
      desc: "Visual dashboards tracking trends in your health metrics over time.",
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="text-center mb-16"
        >
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
          >
            <Star className="w-4 h-4" />
            Features
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
          >
            Everything you need for{" "}
            <span className="text-primary">better health</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-gray-500 max-w-2xl mx-auto text-lg"
          >
            Comprehensive tools for patients and healthcare providers to
            collaborate seamlessly.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="card p-6 group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
              >
                <f.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function AboutSection() {
  const items = [
    "AI-powered symptom analysis in real-time",
    "Secure end-to-end encrypted messaging",
    "Comprehensive health logs & analytics",
    "Voice-enabled health reporting",
    "Smart medication reminders",
    "Risk detection & early warnings",
  ];

  return (
    <section id="about" className="py-24 gradient-bg">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={stagger}
          className="grid lg:grid-cols-2 gap-16 items-center"
        >
          <motion.div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4"
            >
              <Users className="w-4 h-4" />
              About MEDI.AI
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
            >
              Transforming healthcare with{" "}
              <span className="text-primary">artificial intelligence</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-gray-500 text-lg mb-8 leading-relaxed"
            >
              MEDI.AI bridges the gap between patients and doctors with
              intelligent monitoring, predictive analytics, and seamless
              communication — making quality healthcare accessible to everyone.
            </motion.p>
            <motion.div variants={fadeUp} className="space-y-3">
              {items.map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* <motion.div variants={fadeUp} className="relative">
            <div className="card-static p-8 relative z-10">
              <div className="space-y-4">
                {[
                  { label: "AI Analysis Accuracy", value: "98.5%" },
                  { label: "Patient Satisfaction", value: "4.9/5" },
                  { label: "Response Time", value: "<2min" },
                ].map((metric) => (
                  <div
                    key={metric.label}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
                  >
                    <span className="text-gray-600 font-medium">
                      {metric.label}
                    </span>
                    <span className="text-primary font-bold text-lg">
                      {metric.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-full h-full bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl -z-1" />
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
              <Cross className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold">
              MEDI<span className="text-primary-light">.AI</span>
            </span>
          </div>
          <div className="flex items-center gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors no-underline">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-white transition-colors no-underline">
              Terms of Service
            </a>
            <a href="#" className="hover:text-white transition-colors no-underline">
              Contact
            </a>
          </div>
          <p className="text-sm text-gray-500">
            © 2026 MEDI.AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <Footer />
    </main>
  );
}
