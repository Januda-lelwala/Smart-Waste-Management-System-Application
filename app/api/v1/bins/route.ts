import { NextResponse } from 'next/server';
import { bins } from '@/lib/data/store';

export async function GET() {
  return NextResponse.json(bins);
}