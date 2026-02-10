import { NextResponse } from 'next/server';
import { getHoldings } from '@/lib/database';

export async function GET() {
  try {
    const holdings = getHoldings();
    return NextResponse.json(holdings);
  } catch (error) {
    return NextResponse.json([]);
  }
}
