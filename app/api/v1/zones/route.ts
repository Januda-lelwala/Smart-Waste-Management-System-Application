import { NextResponse } from 'next/server';
import { zones } from '@/lib/data/store';

export async function GET() {
  return NextResponse.json(zones);
}