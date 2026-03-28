import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Patient {
  id: string;
  user_id: string;
  date_of_birth: string | null;
  gender: string | null;
  blood_group: string | null;
  medical_history: string | null;
  current_diagnosis: string | null;
  whatsapp_number: string | null;
  assigned_doctor_id: string | null;
  created_at: string;
}

export type PatientInsert = Omit<Patient, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'patients';

export async function createPatient(data: PatientInsert) {
  const { data: patient, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return patient as Patient;
}

export async function getPatientById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!patients_user_id_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getPatientByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!patients_user_id_fkey(*)')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllPatients() {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!patients_user_id_fkey(name, email, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPatientsByDoctor(doctorId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!patients_user_id_fkey(name, email, phone)')
    .eq('assigned_doctor_id', doctorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getPatientByWhatsApp(whatsappNumber: string) {
  // Normalize: strip 'whatsapp:' prefix and any leading '+' if present
  const normalized = whatsappNumber.replace('whatsapp:', '').replace('+', '');
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!patients_user_id_fkey(*)')
    .eq('whatsapp_number', normalized)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function updatePatient(id: string, updates: Partial<PatientInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Patient;
}

export async function deletePatient(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
