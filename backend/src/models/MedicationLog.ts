import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface MedicationLog {
  id: string;
  medication_id: string;
  patient_id: string;
  taken: boolean;
  scheduled_time: string;
  actual_time: string | null;
  notes: string | null;
  created_at: string;
}

export type MedicationLogInsert = Omit<MedicationLog, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'medication_logs';

export async function createMedicationLog(data: MedicationLogInsert) {
  const { data: log, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return log as MedicationLog;
}

export async function getMedicationLogsByPatient(patientId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, medications(name, dosage)')
    .eq('patient_id', patientId)
    .order('scheduled_time', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getMedicationLogsByMedication(medicationId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('medication_id', medicationId)
    .order('scheduled_time', { ascending: false });
  if (error) throw error;
  return data as MedicationLog[];
}

export async function getAdherenceRate(patientId: string, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('taken')
    .eq('patient_id', patientId)
    .gte('scheduled_time', since.toISOString());
  if (error) throw error;
  if (!data || data.length === 0) return 100;
  const taken = data.filter((l: any) => l.taken).length;
  return Math.round((taken / data.length) * 100);
}

export async function updateMedicationLog(id: string, updates: Partial<MedicationLogInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as MedicationLog;
}
