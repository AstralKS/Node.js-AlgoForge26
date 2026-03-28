import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor';
  created_at: string;
}

export type UserInsert = Omit<User, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'users';

export async function createUser(data: UserInsert) {
  const { data: user, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return user as User;
}

export async function getUserById(id: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as User;
}

export async function getUserByEmail(email: string) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data as User | null;
}

export async function getUsersByRole(role: 'patient' | 'doctor') {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .eq('role', role)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as User[];
}

export async function updateUser(id: string, updates: Partial<UserInsert>) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as User;
}

export async function deleteUser(id: string) {
  const { error } = await supabaseAdmin.from(TABLE).delete().eq('id', id);
  if (error) throw error;
}
