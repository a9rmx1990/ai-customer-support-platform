import { NextResponse } from 'next/server';
import { KNOWLEDGE_CHUNKS } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    chunks: KNOWLEDGE_CHUNKS,
    documents_count: KNOWLEDGE_CHUNKS.length,
    vector_dimension: 1536,
    embedding_model: 'text-embedding-3-small',
  });
}
