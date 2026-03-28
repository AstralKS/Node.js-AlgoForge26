import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Symptom {
  id: string;
  patient_id: string;
  date: string;
  description: string;
  severity: number; // 1-10
  source: 'manual' | 'whatsapp' | 'voice';
  ai_analysis: Record<string, any> | null;
  created_at: string;
}

export type SymptomInsert = Omit<Symptom, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'symptoms';

export async function createSymptom(data: SymptomInsert) {
  const { data: symptom, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return symptom as Symptom;
}

export async function getSymptomById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Symptom;
}

export async function getSymptomsByPatient(patientId: string, limit = 50) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Symptom[];
}

export async function getRecentSymptoms(patientId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .gte('date', since.toISOString())
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Symptom[];
}

export async function updateSymptom(id: string, updates: Partial<SymptomInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Symptom;
}

export async function deleteSymptom(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
