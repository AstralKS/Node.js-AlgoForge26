import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Doctor {
  id: string;
  user_id: string;
  specialization: string;
  license_number: string;
  hospital: string | null;
  created_at: string;
}

export type DoctorInsert = Omit<Doctor, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'doctors';

export async function createDoctor(data: DoctorInsert) {
  const { data: doctor, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return doctor as Doctor;
}

export async function getDoctorById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!doctors_user_id_fkey(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function getDoctorByUserId(userId: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!doctors_user_id_fkey(*)')
    .eq('user_id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

export async function getAllDoctors() {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*, users!doctors_user_id_fkey(name, email, phone)')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateDoctor(id: string, updates: Partial<DoctorInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Doctor;
}

export async function deleteDoctor(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
