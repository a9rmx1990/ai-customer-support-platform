import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const isConfigured = supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

/**
 * Server-side Supabase client (anon key).
 * Returns null when credentials are not configured.
 */
export function createServerClient(accessToken?: string) {
  if (!isConfigured) return null;
  return createClient<Database>(supabaseUrl, supabaseAnonKey, accessToken
    ? { global: { headers: { Authorization: `Bearer ${accessToken}` } } }
    : undefined);
}

/**
 * Server-side Supabase admin client (service-role key).
 * ONLY for backend operations that must bypass RLS.
 * Returns null when credentials are not configured.
 * NEVER expose this client to the browser.
 */
export function createAdminClient() {
  if (!isConfigured || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'your-service-role-key') return null;
  const key = supabaseServiceRoleKey;
  return createClient<Database>(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
