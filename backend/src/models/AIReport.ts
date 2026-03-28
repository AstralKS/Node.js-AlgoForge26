import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface AIReport {
  id: string;
  patient_id: string;
  week_of: string;
  summary: string;
  risk_level: RiskLevel;
  recommendations: Record<string, any> | null;
  signed_by_doctor: boolean;
  signed_at: string | null;
  created_at: string;
}

export type AIReportInsert = Omit<AIReport, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'ai_reports';

export async function createAIReport(data: AIReportInsert) {
  const { data: report, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return report as AIReport;
}

export async function getAIReportById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as AIReport;
}

export async function getAIReportsByPatient(patientId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('patient_id', patientId)
    .order('week_of', { ascending: false });
  if (error) throw error;
  return data as AIReport[];
}

export async function getUnsignedReports(doctorId?: string) {
  let query = supabaseAdmin
    .from(TABLE)
    .select('*, patients!ai_reports_patient_id_fkey(*, users!patients_user_id_fkey(name))')
    .eq('signed_by_doctor', false)
    .order('created_at', { ascending: false });

  // If doctorId, filter to that doctor's patients only
  if (doctorId) {
    query = query.eq('patients.assigned_doctor_id', doctorId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function signReport(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update({ signed_by_doctor: true, signed_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as AIReport;
}

export async function getHighRiskReports() {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, patients!ai_reports_patient_id_fkey(*, users!patients_user_id_fkey(name))')
    .in('risk_level', ['high', 'critical'])
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}
