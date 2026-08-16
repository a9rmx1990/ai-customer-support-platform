import { NextRequest } from 'next/server';
import { createClient, type User } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export function isProductionAuthConfigured(): boolean {
  return process.env.NODE_ENV === 'production' && url.startsWith('https://') && anonKey.length > 20;
}

export async function getApiUser(request: NextRequest): Promise<User | null> {
  const match = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i);
  if (!match || !url || !anonKey) return null;
  const client = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await client.auth.getUser(match[1]);
  return error ? null : data.user;
}

export function getBearerToken(request: NextRequest): string | undefined {
  const match = (request.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i);
  return match?.[1];
}

export async function requireApiUser(request: NextRequest): Promise<User | Response> {
  if (process.env.NODE_ENV !== 'production') return (await getApiUser(request)) ?? ({ id: 'development-user' } as User);
  if (!isProductionAuthConfigured()) return new Response(JSON.stringify({ error: 'Authentication is not configured.' }), { status: 503, headers: { 'content-type': 'application/json' } });
  const user = await getApiUser(request);
  if (!user) return new Response(JSON.stringify({ error: 'Authentication required.' }), { status: 401, headers: { 'content-type': 'application/json' } });
  return user;
}

export function isApiError(value: User | Response): value is Response {
  return value instanceof Response;
}
