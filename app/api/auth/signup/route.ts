import { NextRequest, NextResponse } from 'next/server';
import { registerNewPatient } from '@/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { name, email, password, dob, primary_doctor } = body;

    if (!name || !email || !password || typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    if (!name.trim() || !email.trim() || !password.trim()) {
      return NextResponse.json({ error: 'Name, email, and password are required.' }, { status: 400 });
    }

    const newUser = registerNewPatient({
      name,
      email,
      password,
      dob,
      primary_doctor,
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to register patient account.' }, { status: 500 });
  }
}
