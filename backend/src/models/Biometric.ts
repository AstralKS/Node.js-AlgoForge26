import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export type BiometricType = 'bp' | 'glucose' | 'heart_rate' | 'temperature' | 'weight' | 'spo2';

export interface Biometric {
  id: string;
  patient_id: string;
  type: BiometricType;
  value: string; // stored as string to handle "120/80" for BP
  unit: string;
  timestamp: string;
  created_at: string;
}

export type BiometricInsert = Omit<Biometric, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'biometrics';

export async function createBiometric(data: BiometricInsert) {
  const { data: bio, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return bio as Biometric;
}

export async function getBiometricById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Biometric;
}

export async function getBiometricsByPatient(patientId: string, type?: BiometricType, limit = 50) {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (type) query = query.eq('type', type);

  const { data, error } = await query;
  if (error) throw error;
  return data as Biometric[];
}

export async function getRecentBiometrics(patientId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .gte('timestamp', since.toISOString())
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data as Biometric[];
}

export async function updateBiometric(id: string, updates: Partial<BiometricInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Biometric;
}

export async function deleteBiometric(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
