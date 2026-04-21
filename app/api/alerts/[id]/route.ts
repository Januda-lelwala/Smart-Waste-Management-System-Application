import { NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await api.markRead(id);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to mark alert read';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}