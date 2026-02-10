import { NextResponse } from 'next/server';
import { getTrades } from '@/lib/database';

export async function GET() {
  try {
    const trades = getTrades(50);
    return NextResponse.json(trades);
  } catch (error) {
    return NextResponse.json([]);
  }
}
