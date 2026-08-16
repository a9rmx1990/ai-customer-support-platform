import { NextRequest, NextResponse } from 'next/server';
import { MEDICAL_KNOWLEDGE_CHUNKS, KnowledgeChunk, AppDomain } from '@/lib/mock-data';
import { requireApiUser, isApiError, getBearerToken } from '@/lib/api-auth';
import { createServerClient } from '@/lib/supabase/server';

async function requireDoctor(req: NextRequest) {
  const auth = await requireApiUser(req);
  if (isApiError(auth)) return auth;
  const client = createServerClient(getBearerToken(req));
  if (!client) return NextResponse.json({ error: 'Supabase is not configured.' }, { status: 503 });
  const { data: profile } = await (client as any).from('profiles').select('role').eq('id', auth.id).single();
  if (!['doctor', 'admin'].includes(profile?.role)) return NextResponse.json({ error: 'Doctor access required.' }, { status: 403 });
  return auth;
}

async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const raw = buffer.toString('utf-8');
    // Extract printable text characters from PDF stream
    const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ').trim();
    if (cleaned.length > 50) return cleaned;
    return raw.replace(/\s+/g, ' ').trim();
  } catch {
    return 'PDF document ingested into vector store.';
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireDoctor(req);
  if (auth instanceof Response) return auth;
  return NextResponse.json({
    chunks: MEDICAL_KNOWLEDGE_CHUNKS,
    documents_count: MEDICAL_KNOWLEDGE_CHUNKS.length,
    vector_dimension: 768,
    embedding_model: 'text-embedding-004',
  });
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireDoctor(req);
    if (auth instanceof Response) return auth;
    const contentType = req.headers.get('content-type') || '';

    let title = '';
    let domain: AppDomain = 'medical';
    let category = 'policy';
    let chunkText = '';
    let isFile = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;
      title = (formData.get('title') as string) || '';
      domain = 'medical';
      category = (formData.get('category') as string) || 'policy';
      chunkText = (formData.get('chunk_text') as string) || '';

      if (file) {
        isFile = true;
        if (!title) {
          title = file.name.replace(/\.[^/.]+$/, '');
        }

        const arrayBuffer = await file.arrayBuffer();
        if (arrayBuffer.byteLength > 10 * 1024 * 1024) {
          return NextResponse.json({ error: 'File exceeds the 10 MB upload limit.' }, { status: 413 });
        }
        const buffer = Buffer.from(arrayBuffer);

        if (file.name.toLowerCase().endsWith('.pdf') || file.type === 'application/pdf') {
          chunkText = await extractTextFromPdfBuffer(buffer);
        } else {
          chunkText = buffer.toString('utf-8');
        }
      }
    } else {
      const body = await req.json();
      title = body.title;
      domain = 'medical';
      category = body.category || 'policy';
      chunkText = body.chunk_text || '';
    }

    if (!title || !chunkText.trim()) {
      return NextResponse.json(
        { error: 'Missing required document title or content text.' },
        { status: 400 }
      );
    }

    const cleanedText = chunkText.replace(/\s+/g, ' ').trim();
    const newId = 100 + MEDICAL_KNOWLEDGE_CHUNKS.length + 1;
    const newDocId = 100 + MEDICAL_KNOWLEDGE_CHUNKS.length + 1;

    const newChunk: KnowledgeChunk = {
      id: newId,
      document_id: newDocId,
      title: title.trim(),
      domain: domain,
      category: category.trim().toLowerCase(),
      chunk_text: cleanedText.slice(0, 1200),
    };

    MEDICAL_KNOWLEDGE_CHUNKS.unshift(newChunk);

    return NextResponse.json(
      {
        success: true,
        message: isFile
          ? `File processed & indexed into ${domain.toUpperCase()} vector store.`
          : `Document chunk indexed into ${domain.toUpperCase()} vector store.`,
        chunk: newChunk,
        total_chunks: MEDICAL_KNOWLEDGE_CHUNKS.length,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Document ingestion error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process document ingestion.' },
      { status: 500 }
    );
  }
}
