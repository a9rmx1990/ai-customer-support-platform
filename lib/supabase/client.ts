/**
 * Browser-safe Supabase client.
 * 
 * When NEXT_PUBLIC_SUPABASE_URL is not configured (empty string),
 * all operations return safe no-ops so the app works in demo mode
 * without throwing errors during SSR or static prerendering.
 * 
 * When credentials ARE configured, operations use the real Supabase client.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

const isConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.startsWith('https://') &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 20;

// ---------------------------------------------------------------------------
// Safe no-op stubs used when Supabase is not yet configured
// ---------------------------------------------------------------------------
const noopSubscription = { unsubscribe: () => {} };

const noopQuery = {
  select: () => noopQuery,
  eq: () => noopQuery,
  neq: () => noopQuery,
  gte: () => noopQuery,
  lte: () => noopQuery,
  ilike: () => noopQuery,
  not: () => noopQuery,
  order: () => noopQuery,
  limit: () => noopQuery,
  maybeSingle: async () => ({ data: null, error: null }),
  single: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
  then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
};

const noopAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: (_event: any, _cb: any) => ({
    data: { subscription: noopSubscription },
  }),
  signInWithPassword: async () => ({
    data: { user: null, session: null },
    error: { message: 'Supabase not configured. Add credentials to .env.local' },
  }),
  signUp: async () => ({
    data: { user: null, session: null },
    error: { message: 'Supabase not configured. Add credentials to .env.local' },
  }),
  signInWithOAuth: async () => ({
    data: null,
    error: { message: 'Supabase not configured' },
  }),
  signInWithIdToken: async () => ({
    data: { user: null, session: null },
    error: { message: 'Supabase not configured' },
  }),
  signOut: async () => ({ error: null }),
  getUser: async () => ({ data: { user: null }, error: null }),
};

// ---------------------------------------------------------------------------
// Lazy real client — created only once, only when credentials are present
// ---------------------------------------------------------------------------
let _realClient: any = null;

async function getRealClient() {
  if (!isConfigured) return null;
  if (_realClient) return _realClient;
  // Dynamic import prevents createClient from executing at module evaluation time
  const { createClient } = await import('@supabase/supabase-js');
  _realClient = createClient(supabaseUrl, supabaseAnonKey);
  return _realClient;
}

// ---------------------------------------------------------------------------
// Synchronous real client — for use in 'use client' components after mount
// ---------------------------------------------------------------------------
let _syncClient: any = null;

function getSyncClient(): any {
  if (!isConfigured) return null;
  if (_syncClient) return _syncClient;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { createBrowserClient } = require('@supabase/ssr');
    _syncClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
    return _syncClient;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Exported supabase client proxy
// Behaves like the real Supabase client but falls back to no-ops gracefully.
// ---------------------------------------------------------------------------
const noopChannel = {
  on: () => noopChannel,
  subscribe: () => noopChannel,
  unsubscribe: () => {},
};

export const supabase: any = {
  get auth() {
    const client = getSyncClient();
    return client ? client.auth : noopAuth;
  },
  from(table: string) {
    const client = getSyncClient();
    if (!client) return noopQuery;
    return client.from(table);
  },
  rpc(fn: string, args?: any) {
    const client = getSyncClient();
    if (!client) return Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
    return client.rpc(fn, args);
  },
  channel(name: string, opts?: any) {
    const client = getSyncClient();
    if (!client) return noopChannel;
    return client.channel(name, opts);
  },
  removeChannel(channel: any) {
    const client = getSyncClient();
    if (!client) return;
    return client.removeChannel(channel);
  },
  removeAllChannels() {
    const client = getSyncClient();
    if (!client) return;
    return client.removeAllChannels();
  },
  storage: {
    from: () => ({ upload: async () => ({ error: null }) }),
  },
};
