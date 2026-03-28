// Dummy data used across the application

export const patients = [
  {
    id: "1",
    name: "Aarav Sharma",
    age: 45,
    risk: "high",
    lastVisit: "2 days ago",
    condition: "Diabetes Type 2",
    email: "aarav@email.com",
    phone: "+91 98765 43210",
    symptoms: ["Frequent urination", "Fatigue", "Blurred vision"],
    medicines: ["Metformin 500mg", "Glimepiride 2mg"],
    notes: "Patient needs regular blood sugar monitoring. HbA1c levels elevated.",
    visits: [
      { date: "Mar 26, 2026", notes: "Blood sugar 180 mg/dL. Increased Metformin dosage." },
      { date: "Mar 15, 2026", notes: "Routine checkup. BP normal. Advised diet changes." },
      { date: "Feb 28, 2026", notes: "Follow-up on medication. No adverse effects reported." },
    ],
  },
  {
    id: "2",
    name: "Priya Patel",
    age: 32,
    risk: "stable",
    lastVisit: "1 day ago",
    condition: "Hypertension",
    email: "priya@email.com",
    phone: "+91 99887 76655",
    symptoms: ["Headaches", "Dizziness"],
    medicines: ["Amlodipine 5mg", "Atorvastatin 10mg"],
    notes: "BP well controlled. Continue current medication.",
    visits: [
      { date: "Mar 27, 2026", notes: "BP 130/85. Stable. Continue medications." },
      { date: "Mar 10, 2026", notes: "Reported mild headache. BP slightly elevated." },
    ],
  },
  {
    id: "3",
    name: "Rahul Mehta",
    age: 58,
    risk: "high",
    lastVisit: "5 days ago",
    condition: "Cardiac Arrhythmia",
    email: "rahul@email.com",
    phone: "+91 88776 65544",
    symptoms: ["Palpitations", "Shortness of breath", "Chest discomfort"],
    medicines: ["Metoprolol 50mg", "Warfarin 5mg", "Aspirin 75mg"],
    notes: "Requires ECG monitoring monthly. Monitor INR levels closely.",
    visits: [
      { date: "Mar 23, 2026", notes: "ECG showed irregular rhythm. Adjusted Metoprolol dose." },
      { date: "Mar 5, 2026", notes: "INR levels within range. Continue Warfarin." },
    ],
  },
  {
    id: "4",
    name: "Sneha Gupta",
    age: 28,
    risk: "stable",
    lastVisit: "3 days ago",
    condition: "Asthma",
    email: "sneha@email.com",
    phone: "+91 77665 54433",
    symptoms: ["Wheezing", "Cough at night"],
    medicines: ["Salbutamol Inhaler", "Montelukast 10mg"],
    notes: "Symptoms well controlled. Seasonal triggers noted.",
    visits: [
      { date: "Mar 25, 2026", notes: "Lung function test normal. Continue current treatment." },
    ],
  },
  {
    id: "5",
    name: "Vikram Singh",
    age: 62,
    risk: "moderate",
    lastVisit: "1 week ago",
    condition: "COPD",
    email: "vikram@email.com",
    phone: "+91 66554 43322",
    symptoms: ["Chronic cough", "Breathlessness on exertion"],
    medicines: ["Tiotropium Inhaler", "Prednisolone 10mg"],
    notes: "Advised to quit smoking. Pulmonary rehab recommended.",
    visits: [
      { date: "Mar 21, 2026", notes: "SpO2 94%. Mild exacerbation. Short course of steroids." },
      { date: "Mar 1, 2026", notes: "Stable. FEV1 improved slightly." },
    ],
  },
];

export const medications = [
  { time: "8:00 AM", name: "Metformin 500mg", taken: true },
  { time: "12:00 PM", name: "Vitamin D3", taken: false },
  { time: "2:00 PM", name: "Atorvastatin 10mg", taken: false },
  { time: "9:00 PM", name: "Melatonin 3mg", taken: false },
];

export const healthLogs = [
  { date: "Today", type: "Temperature", value: "98.6°F", status: "normal" },
  { date: "Today", type: "Blood Pressure", value: "120/80 mmHg", status: "normal" },
  { date: "Yesterday", type: "Temperature", value: "101°F", status: "warning" },
  { date: "Yesterday", type: "Heart Rate", value: "88 bpm", status: "normal" },
  { date: "2 days ago", type: "Blood Sugar", value: "145 mg/dL", status: "warning" },
  { date: "2 days ago", type: "SpO2", value: "97%", status: "normal" },
];

export const aiMessages = [
  { role: "assistant", content: "Hello! I'm your AI health assistant. How can I help you today?" },
  { role: "user", content: "I've been having headaches for the past 3 days." },
  {
    role: "assistant",
    content:
      "I understand. Persistent headaches can have various causes. Based on your recent health logs, your blood pressure has been slightly elevated. I recommend: \n\n1. Stay hydrated\n2. Monitor your BP regularly\n3. If headaches persist, consult Dr. Patel\n\nWould you like me to schedule an appointment?",
  },
];

export const doctorMessages = [
  {
    id: 1,
    patient: "Aarav Sharma",
    lastMessage: "Thank you doctor, I'll follow the diet plan.",
    time: "10 min ago",
    unread: 2,
    avatar: "AS",
  },
  {
    id: 2,
    patient: "Priya Patel",
    lastMessage: "My BP readings have been normal this week.",
    time: "1 hour ago",
    unread: 0,
    avatar: "PP",
  },
  {
    id: 3,
    patient: "Rahul Mehta",
    lastMessage: "I felt palpitations again last night.",
    time: "3 hours ago",
    unread: 1,
    avatar: "RM",
  },
  {
    id: 4,
    patient: "Sneha Gupta",
    lastMessage: "The new inhaler is working better.",
    time: "Yesterday",
    unread: 0,
    avatar: "SG",
  },
];

export const patientMessages = [
  {
    sender: "Dr. Amit Patel",
    content: "Your latest blood work looks good. Keep up the healthy diet!",
    time: "10:30 AM",
    isDoctor: true,
  },
  {
    sender: "You",
    content: "Thank you, Doctor! Should I continue with the same medication?",
    time: "10:35 AM",
    isDoctor: false,
  },
  {
    sender: "Dr. Amit Patel",
    content: "Yes, continue with Metformin. We'll review again in 2 weeks.",
    time: "10:40 AM",
    isDoctor: true,
  },
];

export const chartData = [
  { name: "Mon", bp: 120, hr: 72, temp: 98.4 },
  { name: "Tue", bp: 125, hr: 75, temp: 98.6 },
  { name: "Wed", bp: 118, hr: 70, temp: 99.0 },
  { name: "Thu", bp: 130, hr: 80, temp: 101.0 },
  { name: "Fri", bp: 122, hr: 73, temp: 98.8 },
  { name: "Sat", bp: 119, hr: 71, temp: 98.5 },
  { name: "Sun", bp: 121, hr: 74, temp: 98.6 },
];
