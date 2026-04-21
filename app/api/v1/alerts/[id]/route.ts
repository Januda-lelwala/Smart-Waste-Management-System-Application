import { NextResponse } from 'next/server';
import { alerts } from '@/lib/data/store';

export async function PATCH(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = alerts.find(a => a.id === id);
  if (!alert) return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
  alert.read = true;
  return NextResponse.json(alert);
}