import { NextResponse } from 'next/server';

// Demo stats - in production, connect to a database
const stats = {
  total_trades: 0,
  winning_trades: 0,
  total_profit: 0,
  total_volume: 0,
  holdings_count: 0,
  portfolio_value: 500,
  win_rate: '0',
  status: 'SCANNING',
  wallet: '0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64'
};

export async function GET() {
  return NextResponse.json(stats);
}
