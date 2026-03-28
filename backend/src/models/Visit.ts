import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Visit {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  date: string;
  notes: string | null;
  transcript: string | null;
  prescriptions: Record<string, any> | null;
  follow_up_date: string | null;
  created_at: string;
}

export type VisitInsert = Omit<Visit, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'visits';

export async function createVisit(data: VisitInsert) {
  const { data: visit, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return visit as Visit;
}

export async function getVisitById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function getVisitsByPatient(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data as Visit[];
}

export async function getVisitsByDoctor(doctorId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, patients!visits_patient_id_fkey(*, users!patients_user_id_fkey(name))')
    .eq('doctor_id', doctorId)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUpcomingVisits(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .gte('date', new Date().toISOString())
    .order('date', { ascending: true });
  if (error) throw error;
  return data as Visit[];
}

export async function updateVisit(id: string, updates: Partial<VisitInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function deleteVisit(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
