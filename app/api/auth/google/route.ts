import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithGoogle } from '@/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, google_id, avatar } = body;

    const targetEmail = (email || 'google.patient@example.com').toString().trim();
    const targetName = (name || 'Google Verified Patient').toString().trim();

    const user = authenticateWithGoogle({
      name: targetName,
      email: targetEmail,
      google_id: google_id || `g-user-${Date.now()}`,
      avatar: avatar || 'https://lh3.googleusercontent.com/a/default-user',
    });

    return NextResponse.json({
      success: true,
      provider: 'google',
      user,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Google OAuth authentication failed.' }, { status: 500 });
  }
}
