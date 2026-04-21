import { NextResponse } from 'next/server';
import { alerts } from '@/lib/data/store';

export async function GET() {
  return NextResponse.json(alerts);
}

export async function PATCH() {
  alerts.forEach(a => { a.read = true; });
  return NextResponse.json({ updated: alerts.length });
}