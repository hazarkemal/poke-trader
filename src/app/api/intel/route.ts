import { NextResponse } from 'next/server';

// Demo intelligence data - in production, fetch from VPS
const demoIntel = {
  timestamp: new Date().toISOString(),
  sentiment: {
    overall: 'neutral',
    bullish: 12,
    bearish: 8,
    neutral: 15
  },
  trending: {
    reddit: [
      { card: 'charizard', score: 450 },
      { card: 'pikachu', score: 280 },
      { card: 'umbreon', score: 195 }
    ],
    twitter: ['charizard', 'mewtwo', 'rayquaza']
  },
  arbitrage: [],
  recommendations: [
    {
      action: 'hold',
      card: 'ALL',
      reason: 'Agent is scanning markets. Waiting for funded wallet.',
      confidence: 50
    }
  ]
};

export async function GET() {
  // In production: fetch from VPS API
  // const response = await fetch('http://138.68.74.56:3200/api/intel');
  // const intel = await response.json();
  
  return NextResponse.json(demoIntel);
}
