import { NextResponse } from 'next/server';
import { KNOWLEDGE_CHUNKS, KnowledgeChunk, AppDomain } from '@/lib/mock-data';

export async function GET() {
  return NextResponse.json({
    chunks: KNOWLEDGE_CHUNKS,
    documents_count: KNOWLEDGE_CHUNKS.length,
    vector_dimension: 1536,
    embedding_model: 'text-embedding-004',
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, domain, category, chunk_text } = body;

    if (!title || !domain || !category || !chunk_text) {
      return NextResponse.json(
        { error: 'Missing required fields: title, domain, category, chunk_text' },
        { status: 400 }
      );
    }

    const newId = 100 + KNOWLEDGE_CHUNKS.length + 1;
    const newDocId = 100 + KNOWLEDGE_CHUNKS.length + 1;

    const newChunk: KnowledgeChunk = {
      id: newId,
      document_id: newDocId,
      title: title.trim(),
      domain: domain as AppDomain,
      category: category.trim().toLowerCase(),
      chunk_text: chunk_text.trim(),
    };

    KNOWLEDGE_CHUNKS.unshift(newChunk);

    return NextResponse.json(
      {
        success: true,
        message: 'Knowledge document chunk indexed into vector store successfully.',
        chunk: newChunk,
        total_chunks: KNOWLEDGE_CHUNKS.length,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process knowledge document ingestion.' },
      { status: 500 }
    );
  }
}

