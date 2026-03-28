import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export type AlertType = 'critical' | 'weekly' | 'info';

export interface Alert {
  id: string;
  patient_id: string;
  doctor_id: string | null;
  type: AlertType;
  message: string;
  ai_explanation: string | null;
  read: boolean;
  created_at: string;
}

export type AlertInsert = Omit<Alert, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'alerts';

export async function createAlert(data: AlertInsert) {
  const { data: alert, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return alert as Alert;
}

export async function getAlertsByPatient(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Alert[];
}

export async function getAlertsByDoctor(doctorId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, patients!alerts_patient_id_fkey(*, users!patients_user_id_fkey(name))')
    .eq('doctor_id', doctorId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getUnreadAlerts(userId: string, role: 'patient' | 'doctor') {
  const field = role === 'patient' ? 'patient_id' : 'doctor_id';
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq(field, userId)
    .eq('read', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as Alert[];
}

export async function getCriticalAlerts(doctorId?: string) {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*, patients!alerts_patient_id_fkey(*, users!patients_user_id_fkey(name))')
    .eq('type', 'critical')
    .eq('read', false)
    .order('created_at', { ascending: false });

  if (doctorId) query = query.eq('doctor_id', doctorId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function markAlertRead(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Alert;
}

export async function markAllAlertsRead(userId: string, role: 'patient' | 'doctor') {
  const field = role === 'patient' ? 'patient_id' : 'doctor_id';
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ read: true })
    .eq(field, userId)
    .eq('read', false);
  if (error) throw error;
}
