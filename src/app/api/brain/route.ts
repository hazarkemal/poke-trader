import { NextResponse } from 'next/server';

// Simulated brain thoughts - in production, fetch from VPS
const generateThoughts = () => {
  const types = ['scan', 'analysis', 'decision', 'learn'] as const;
  const thoughts = [
    { type: 'scan', messages: [
      'Scanning r/PokemonTCG for trending discussions...',
      'Checking TCGPlayer for price updates...',
      'Monitoring eBay sold listings...',
      'Scanning Courtyard.io marketplace...',
      'Fetching Twitter sentiment data...'
    ]},
    { type: 'analysis', messages: [
      'Calculating fair value for Charizard VMAX using 3-source weighted average',
      'Analyzing price spread between TCGPlayer and eBay',
      'Reddit mention frequency up 23% for Umbreon Alt Art',
      'Market sentiment shifting bullish based on Twitter analysis',
      'Comparing graded vs raw card price differentials'
    ]},
    { type: 'decision', messages: [
      'Charizard VMAX: 12% below fair value - monitoring for better entry',
      'No opportunities meeting 15% discount threshold currently',
      'Holding cash - waiting for market correction',
      'Strategy confidence: 75% based on recent performance'
    ]},
    { type: 'learn', messages: [
      'Recording market conditions for future pattern matching',
      'Updating price history database',
      'No trades to learn from yet - awaiting first trade'
    ]}
  ];
  
  const result = [];
  const now = Date.now();
  
  for (let i = 0; i < 15; i++) {
    const category = thoughts[Math.floor(Math.random() * thoughts.length)];
    const message = category.messages[Math.floor(Math.random() * category.messages.length)];
    result.push({
      timestamp: new Date(now - i * 30000).toISOString(),
      type: category.type,
      message
    });
  }
  
  return result;
};

export async function GET() {
  // Try to fetch from VPS first
  // const response = await fetch('http://138.68.74.56:3200/api/brain');
  
  const thoughts = generateThoughts();
  
  return NextResponse.json({
    thoughts,
    strategy: {
      minDiscount: 0.15,
      profitTarget: 0.10,
      stopLoss: 0.20,
      maxPosition: 100,
      confidence: 0.5,
      version: 1
    },
    lastBackup: new Date(Date.now() - 86400000).toISOString(),
    learningStats: {
      totalLessons: 0,
      lastLesson: null
    }
  });
}

export const revalidate = 10;
