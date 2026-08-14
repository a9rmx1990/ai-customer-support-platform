import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email address is required.' }, { status: 400 });
    }

    const user = authenticateUser(email);

    if (!user) {
      return NextResponse.json({ error: 'Account not found. Please register first.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to authenticate user.' }, { status: 500 });
  }
}
