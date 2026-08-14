import { NextRequest, NextResponse } from 'next/server';
import { authenticateWithGoogle } from '@/lib/auth-service';

/**
 * Decodes Google JWT ID token payload (Base64 decode)
 */
function parseJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { credential, name, email, google_id, avatar } = body;

    let targetEmail = email;
    let targetName = name;
    let targetGoogleId = google_id;
    let targetAvatar = avatar;

    // If real Google ID Token credential passed from client-side Google Identity SDK
    if (credential) {
      const decodedPayload = parseJwtPayload(credential);
      if (decodedPayload && decodedPayload.email) {
        targetEmail = decodedPayload.email;
        targetName = decodedPayload.name || decodedPayload.given_name || 'Google User';
        targetGoogleId = decodedPayload.sub;
        targetAvatar = decodedPayload.picture;
      }
    }

    targetEmail = (targetEmail || 'google.patient@example.com').toString().trim();
    targetName = (targetName || 'Google Verified Patient').toString().trim();

    const user = authenticateWithGoogle({
      name: targetName,
      email: targetEmail,
      google_id: targetGoogleId || `g-user-${Date.now()}`,
      avatar: targetAvatar || 'https://lh3.googleusercontent.com/a/default-user',
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
