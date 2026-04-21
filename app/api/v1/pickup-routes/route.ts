import { NextResponse } from 'next/server';
import { pickupRoutes } from '@/lib/data/store';

export async function GET() {
  return NextResponse.json(pickupRoutes);
}