import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Lazy-initialized browser-safe Supabase client.
 * Uses the public anon key — safe to expose to the browser.
 * RLS policies on the database enforce authorization per row.
 * 
 * Returns null when credentials are not yet configured,
 * allowing the app to run in demo mode.
 */

let _supabase: SupabaseClient<Database> | null = null;

function getSupabaseClient(): SupabaseClient<Database> | null {
  if (!supabaseUrl || !supabaseUrl.startsWith('https://') || !supabaseAnonKey || supabaseAnonKey.length < 20) {
    return null;
  }
  if (!_supabase) {
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

/**
 * Browser Supabase client — lazily initialized.
 * When Supabase URL is not configured, all operations gracefully no-op.
 */
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getSupabaseClient();
    if (!client) {
      // Return safe no-op stubs for common operations
      if (prop === 'auth') {
        return {
          getSession: async () => ({ data: { session: null }, error: null }),
          onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
          signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
          signUp: async () => ({ error: new Error('Supabase not configured') }),
          signInWithOAuth: async () => ({ error: new Error('Supabase not configured') }),
          signInWithIdToken: async () => ({ error: new Error('Supabase not configured') }),
          signOut: async () => ({ error: null }),
        };
      }
      // For .from() queries, return a stub that resolves to empty/null
      if (prop === 'from') {
        return () => ({
          select: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: new Error('Supabase not configured') }),
              maybeSingle: async () => ({ data: null, error: null }),
              gte: () => ({ lte: () => ({ not: () => ({ data: [], error: null }) }) }),
              not: () => ({ data: [], error: null }),
            }),
            ilike: () => ({ data: [], error: null }),
          }),
          insert: () => ({ data: null, error: null }),
          update: () => ({ eq: () => ({ data: null, error: null }) }),
        });
      }
      return undefined;
    }
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
