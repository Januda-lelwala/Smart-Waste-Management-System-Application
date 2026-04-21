import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/data/store';

export async function GET() {
  return NextResponse.json(getAnalytics());
}