import { NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

export async function GET() {
  try {
    const data = await api.alerts();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch alerts';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

export async function PATCH() {
  try {
    const data = await api.markAllRead();
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to mark alerts read';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}