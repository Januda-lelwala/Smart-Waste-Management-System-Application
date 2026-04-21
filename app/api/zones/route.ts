import { NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

export async function GET() {
  try {
    const data = await api.zones();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch zones';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}