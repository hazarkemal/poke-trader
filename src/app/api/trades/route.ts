import { NextResponse } from 'next/server';

// Demo trades - in production, connect to a database
const trades: any[] = [];

export async function GET() {
  return NextResponse.json(trades);
}
