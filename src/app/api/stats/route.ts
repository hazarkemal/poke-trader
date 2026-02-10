import { NextResponse } from 'next/server';
import { getStats } from '@/lib/database';

export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json({
      total_trades: 0,
      winning_trades: 0,
      total_profit: 0,
      total_volume: 0,
      holdings_count: 0,
      portfolio_value: 0,
      win_rate: '0'
    });
  }
}
