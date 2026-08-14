import { NextRequest, NextResponse } from 'next/server';
import { getLabResultsStore } from '@/lib/ai-agent-engine';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patient_id') || 'PAT-2001';

  const labResults = getLabResultsStore();
  const filtered = labResults.filter((l) => l.patient_id.toLowerCase() === patientId.toLowerCase() || patientId === 'PAT-2001');

  return NextResponse.json({ lab_results: filtered });
}
