/**
 * Real-Time Doctor <-> Patient Chat Service
 * 
 * Provides Supabase PostgreSQL operations and Supabase Realtime WebSocket subscriptions
 * for real-time multi-user communication between Patients and Doctors.
 * 
 * Enforces RLS: Sender identity is verified by Supabase Auth (auth.uid()).
 */

import { supabase } from '../supabase/client';
import { createServerClient } from '../supabase/server';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseConfigured = SUPABASE_URL.startsWith('https://');

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface ConversationItem {
  id: string;
  patientId: string;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
  otherUser: {
    id: string;
    fullName: string;
    role: 'patient' | 'doctor' | 'admin';
    avatarUrl?: string | null;
    specialization?: string | null;
  };
}

export interface RealtimeChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
  isSelf: boolean;
}

// ---------------------------------------------------------------------------
// fetchUserConversations
// Returns all active conversations for the authenticated user (Patient or Doctor)
// ---------------------------------------------------------------------------
export async function fetchUserConversations(currentUserId: string): Promise<{
  success: boolean;
  conversations: ConversationItem[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: true, conversations: [] };
  }

  try {
    // Check if currentUserId maps to a doctor_profile id as well
    const { data: docProf } = await supabase
      .from('doctor_profiles')
      .select('id')
      .eq('user_id', currentUserId)
      .maybeSingle();

    const docProfId = docProf?.id;

    const orCondition = docProfId
      ? `patient_id.eq.${currentUserId},doctor_id.eq.${currentUserId},doctor_id.eq.${docProfId}`
      : `patient_id.eq.${currentUserId},doctor_id.eq.${currentUserId}`;

    const { data: convs, error } = await supabase
      .from('conversations')
      .select(`
        id, patient_id, doctor_id, created_at, updated_at,
        patient_profile:profiles!patient_id (id, full_name, role, avatar_url),
        doctor_profile:profiles!doctor_id (id, full_name, role, avatar_url)
      `)
      .or(orCondition)
      .order('updated_at', { ascending: false });

    if (error) return { success: false, conversations: [], error: error.message };

    // Also fetch doctor specializations if available
    const { data: doctorSpecs } = await supabase
      .from('doctor_profiles')
      .select('user_id, specialization');

    const specMap = new Map<string, string>();
    (doctorSpecs ?? []).forEach((d: any) => {
      if (d.user_id && d.specialization) specMap.set(d.user_id, d.specialization);
    });

    const conversations: ConversationItem[] = (convs ?? []).map((row: any) => {
      const isPatient = row.patient_id === currentUserId;
      const otherProfile = isPatient ? row.doctor_profile : row.patient_profile;

      return {
        id: row.id,
        patientId: row.patient_id,
        doctorId: row.doctor_id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        otherUser: {
          id: otherProfile?.id ?? (isPatient ? row.doctor_id : row.patient_id),
          fullName: otherProfile?.full_name ?? (isPatient ? 'Doctor' : 'Patient'),
          role: (otherProfile?.role ?? (isPatient ? 'doctor' : 'patient')) as ConversationItem['otherUser']['role'],
          avatarUrl: otherProfile?.avatar_url ?? null,
          specialization: specMap.get(otherProfile?.id) ?? null,
        },
      };
    });

    return { success: true, conversations };
  } catch {
    return { success: false, conversations: [], error: 'FETCH_CONVERSATIONS_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// getOrCreateConversation
// Finds existing conversation between patient & doctor or creates a new one
// ---------------------------------------------------------------------------
export async function getOrCreateConversation(params: {
  patientId: string;
  doctorId: string;
}): Promise<{
  success: boolean;
  conversationId?: string;
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: false, error: 'Supabase credentials not configured.' };
  }

  try {
    // 1. Try fetching existing conversation
    const { data: existing, error: findError } = await supabase
      .from('conversations')
      .select('id')
      .eq('patient_id', params.patientId)
      .eq('doctor_id', params.doctorId)
      .maybeSingle();

    if (!findError && existing?.id) {
      return { success: true, conversationId: existing.id };
    }

    // 2. Create new conversation if not found
    const { data: newConv, error: createError } = await supabase
      .from('conversations')
      .insert({
        patient_id: params.patientId,
        doctor_id: params.doctorId,
      })
      .select('id')
      .single();

    if (createError) {
      return { success: false, error: createError.message };
    }

    return { success: true, conversationId: (newConv as any)?.id };
  } catch {
    return { success: false, error: 'CREATE_CONVERSATION_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// fetchConversationMessages
// Retrieves message history for a conversation
// ---------------------------------------------------------------------------
export async function fetchConversationMessages(
  conversationId: string,
  currentUserId: string
): Promise<{
  success: boolean;
  messages: RealtimeChatMessage[];
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: true, messages: [] };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id, conversation_id, sender_id, content, created_at,
        sender_profile:profiles!sender_id (full_name)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) return { success: false, messages: [], error: error.message };

    const messages: RealtimeChatMessage[] = (data ?? []).map((row: any) => ({
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      senderName: row.sender_profile?.full_name ?? 'User',
      content: row.content,
      createdAt: row.created_at,
      isSelf: row.sender_id === currentUserId,
    }));

    return { success: true, messages };
  } catch {
    return { success: false, messages: [], error: 'FETCH_MESSAGES_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// sendRealtimeMessage
// Inserts a new chat message into PostgreSQL (triggering Realtime broadcast)
// ---------------------------------------------------------------------------
export async function sendRealtimeMessage(params: {
  conversationId: string;
  senderId: string;
  content: string;
}): Promise<{
  success: boolean;
  message?: RealtimeChatMessage;
  error?: string;
}> {
  if (!supabaseConfigured) {
    return { success: false, error: 'Supabase not configured.' };
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: params.conversationId,
        sender_id: params.senderId,
        content: params.content.trim(),
      })
      .select(`
        id, conversation_id, sender_id, content, created_at,
        sender_profile:profiles!sender_id (full_name)
      `)
      .single();

    if (error) return { success: false, error: error.message };

    const row = data as any;

    // Update conversation timestamp asynchronously
    supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', params.conversationId)
      .then(() => {});

    return {
      success: true,
      message: {
        id: row.id,
        conversationId: row.conversation_id,
        senderId: row.sender_id,
        senderName: row.sender_profile?.full_name ?? 'User',
        content: row.content,
        createdAt: row.created_at,
        isSelf: true,
      },
    };
  } catch {
    return { success: false, error: 'SEND_MESSAGE_FAILED' };
  }
}

// ---------------------------------------------------------------------------
// subscribeToConversationMessages
// Subscribes to live WebSocket broadcast on public.messages for a conversation
// Returns an unsubscribe function to prevent memory leaks and duplicate listeners
// ---------------------------------------------------------------------------
export function subscribeToConversationMessages(
  conversationId: string,
  currentUserId: string,
  onNewMessage: (msg: RealtimeChatMessage) => void
): () => void {
  if (!supabaseConfigured || typeof window === 'undefined') {
    return () => {};
  }

  const channelName = `conversation:${conversationId}:${Date.now()}`;

  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload: any) => {
        const newMsg = payload.new;
        if (!newMsg) return;

        // Fetch sender name if needed
        let senderName = 'User';
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', newMsg.sender_id)
            .single();
          if (profile?.full_name) senderName = profile.full_name;
        } catch {
          // ignore
        }

        onNewMessage({
          id: newMsg.id,
          conversationId: newMsg.conversation_id,
          senderId: newMsg.sender_id,
          senderName,
          content: newMsg.content,
          createdAt: newMsg.created_at,
          isSelf: newMsg.sender_id === currentUserId,
        });
      }
    )
    .subscribe();

  // Return unsubscribe handler
  return () => {
    supabase.removeChannel(channel);
  };
}
