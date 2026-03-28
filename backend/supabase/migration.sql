-- ============================================================
-- MediAI — Supabase SQL Migration
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'doctor')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_role ON users (role);

-- 2. Doctors
CREATE TABLE IF NOT EXISTS doctors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT NOT NULL,
  hospital TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_doctors_user_id ON doctors (user_id);

-- 3. Patients
CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date_of_birth TEXT,
  gender TEXT,
  blood_group TEXT,
  medical_history TEXT,
  current_diagnosis TEXT,
  whatsapp_number TEXT,
  assigned_doctor_id UUID REFERENCES doctors(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients (user_id);
CREATE INDEX idx_patients_assigned_doctor ON patients (assigned_doctor_id);
CREATE INDEX idx_patients_whatsapp ON patients (whatsapp_number);

-- 4. Symptoms
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL,
  description TEXT NOT NULL,
  severity INTEGER NOT NULL CHECK (severity >= 1 AND severity <= 10),
  source TEXT NOT NULL CHECK (source IN ('manual', 'whatsapp', 'voice')),
  ai_analysis JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_symptoms_patient ON symptoms (patient_id);
CREATE INDEX idx_symptoms_date ON symptoms (date DESC);
CREATE INDEX idx_symptoms_severity ON symptoms (severity);

-- 5. Medications
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  prescribed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medications_patient ON medications (patient_id);

-- 6. Medication Logs
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  taken BOOLEAN NOT NULL DEFAULT false,
  scheduled_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medlogs_patient ON medication_logs (patient_id);
CREATE INDEX idx_medlogs_medication ON medication_logs (medication_id);
CREATE INDEX idx_medlogs_time ON medication_logs (scheduled_time DESC);

-- 7. Biometrics
CREATE TABLE IF NOT EXISTS biometrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bp', 'glucose', 'heart_rate', 'temperature', 'weight', 'spo2')),
  value TEXT NOT NULL,
  unit TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_biometrics_patient ON biometrics (patient_id);
CREATE INDEX idx_biometrics_type ON biometrics (type);
CREATE INDEX idx_biometrics_timestamp ON biometrics (timestamp DESC);

-- 8. Visits
CREATE TABLE IF NOT EXISTS visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  date TIMESTAMPTZ NOT NULL,
  notes TEXT,
  transcript TEXT,
  prescriptions JSONB,
  follow_up_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_visits_patient ON visits (patient_id);
CREATE INDEX idx_visits_doctor ON visits (doctor_id);
CREATE INDEX idx_visits_date ON visits (date DESC);

-- 9. AI Reports
CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  week_of TEXT NOT NULL,
  summary TEXT NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  recommendations JSONB,
  signed_by_doctor BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_aireports_patient ON ai_reports (patient_id);
CREATE INDEX idx_aireports_risk ON ai_reports (risk_level);
CREATE INDEX idx_aireports_unsigned ON ai_reports (signed_by_doctor) WHERE signed_by_doctor = false;

-- 10. Alerts
CREATE TABLE IF NOT EXISTS alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id),
  type TEXT NOT NULL CHECK (type IN ('critical', 'weekly', 'info')),
  message TEXT NOT NULL,
  ai_explanation TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_alerts_patient ON alerts (patient_id);
CREATE INDEX idx_alerts_doctor ON alerts (doctor_id);
CREATE INDEX idx_alerts_unread ON alerts (read) WHERE read = false;
CREATE INDEX idx_alerts_type ON alerts (type);

-- 11. Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_sender ON messages (sender_id);
CREATE INDEX idx_messages_receiver ON messages (receiver_id);
CREATE INDEX idx_messages_conversation ON messages (sender_id, receiver_id);
CREATE INDEX idx_messages_unread ON messages (receiver_id, read) WHERE read = false;

-- ============================================================
-- Done! All 11 tables created with indexes.
-- ============================================================
