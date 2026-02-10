import { NextResponse } from 'next/server';

// Demo holdings - in production, connect to a database
const holdings: any[] = [];

export async function GET() {
  return NextResponse.json(holdings);
}
