import { NextRequest, NextResponse } from 'next/server';
import { findUserByToken } from '@/lib/auth-service';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '').trim();

  if (!token) {
    return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
  }

  const user = findUserByToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  return NextResponse.json({ user });
}
