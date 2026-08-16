import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, authenticateDemoUser } from '@/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Use Supabase Auth in production.' }, { status: 410 });
    const body = await req.json().catch(() => ({}));
    const { email, password, is_demo_click } = body;

    // Handle One-Click Demo Accounts explicitly
    if (is_demo_click && email) {
      const demoUser = authenticateDemoUser(email);
      if (demoUser) {
        return NextResponse.json({ success: true, user: demoUser });
      }
    }

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 400 });
    }

    const user = authenticateUser(cleanEmail, cleanPassword);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate user.' }, { status: 500 });
  }
}
