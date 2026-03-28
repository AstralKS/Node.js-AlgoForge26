import { supabaseAdmin } from '../config/supabase';

// ── Types ────────────────────────────────────────────────
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export type MessageInsert = Omit<Message, 'id' | 'created_at'>;

// ── CRUD Helpers ─────────────────────────────────────────
const TABLE = 'messages';

export async function createMessage(data: MessageInsert) {
  const { data: msg, error } = await supabaseAdmin
    .from(TABLE)
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return msg as Message;
}

export async function getConversation(userId1: string, userId2: string, limit = 100) {
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
    )
    .order('created_at', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return data as Message[];
}

export async function getMessageThreads(userId: string) {
  // Get latest message per conversation partner
  const { data, error } = await supabaseAdmin
    .from(TABLE)
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });
  if (error) throw error;

  // Group by conversation partner and return latest message per thread
  const threads = new Map<string, Message>();
  for (const msg of (data as Message[])) {
    const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
    if (!threads.has(partnerId)) {
      threads.set(partnerId, msg);
    }
  }
  return Array.from(threads.values());
}

export async function getUnreadCount(userId: string) {
  const { count, error } = await supabaseAdmin
    .from(TABLE)
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('read', false);
  if (error) throw error;
  return count || 0;
}

export async function markMessagesRead(senderId: string, receiverId: string) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ read: true })
    .eq('sender_id', senderId)
    .eq('receiver_id', receiverId)
    .eq('read', false);
  if (error) throw error;
}
