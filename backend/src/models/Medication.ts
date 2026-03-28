import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Medication {
  id: string;
  patient_id: string;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
  prescribed_by: string | null;
  created_at: string;
}

export type MedicationInsert = Omit<Medication, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'medications';

export async function createMedication(data: MedicationInsert) {
  const { data: med, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return med as Medication;
}

export async function getMedicationById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Medication;
}

export async function getMedicationsByPatient(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data as Medication[];
}

export async function getActiveMedications(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .or('end_date.is.null,end_date.gte.' + new Date().toISOString().split('T')[0])
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data as Medication[];
}

export async function updateMedication(id: string, updates: Partial<MedicationInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Medication;
}

export async function deleteMedication(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
