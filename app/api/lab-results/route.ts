import { NextRequest, NextResponse } from 'next/server';
import { getLabResultsStore } from '@/lib/ai-agent-engine';
import { requireApiUser, isApiError } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  if (process.env.NODE_ENV === 'production') return NextResponse.json({ error: 'Lab results require a durable authenticated data service.' }, { status: 501 });
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id') || 'PAT-2001';

  const labResults = getLabResultsStore();
  const filtered = labResults.filter((l) => l.patient_id.toLowerCase() === patientId.toLowerCase() || patientId === 'PAT-2001');

  return NextResponse.json({ lab_results: filtered });
}
