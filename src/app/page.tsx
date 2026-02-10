'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  total_trades: number;
  winning_trades: number;
  total_profit: number;
  total_volume: number;
  holdings_count: number;
  portfolio_value: number;
  win_rate: string;
}

interface Trade {
  id: number;
  timestamp: string;
  type: 'buy' | 'sell';
  card_name: string;
  price_usd: number;
  profit_usd: number | null;
  status: string;
}

interface Holding {
  card_id: string;
  card_name: string;
  card_image: string | null;
  buy_price: number;
  current_price: number | null;
}

// Demo data for initial display
const demoStats: Stats = {
  total_trades: 0,
  winning_trades: 0,
  total_profit: 0,
  total_volume: 0,
  holdings_count: 0,
  portfolio_value: 0,
  win_rate: '0'
};

const demoTrades: Trade[] = [];
const demoHoldings: Holding[] = [];

const demoPnlData = [
  { date: 'Day 1', pnl: 0, portfolio: 500 },
];

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>(demoStats);
  const [trades, setTrades] = useState<Trade[]>(demoTrades);
  const [holdings, setHoldings] = useState<Holding[]>(demoHoldings);
  const [pnlData, setPnlData] = useState(demoPnlData);
  const [walletAddress, setWalletAddress] = useState('Loading...');
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const [statsRes, tradesRes, holdingsRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/trades'),
          fetch('/api/holdings')
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (tradesRes.ok) setTrades(await tradesRes.json());
        if (holdingsRes.ok) setHoldings(await holdingsRes.json());
        setIsLive(true);
      } catch (error) {
        console.log('Using demo data');
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎴</div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              PokeTrader
            </h1>
            <p className="text-gray-400">Autonomous Pokemon Card Trading Agent</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-500 live-indicator' : 'bg-gray-500'}`} />
          <span className="text-sm text-gray-400">{isLive ? 'LIVE' : 'OFFLINE'}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Portfolio Value</div>
          <div className="text-3xl font-bold text-green-400">
            ${stats.portfolio_value.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">of $500 budget</div>
        </div>
        
        <div className="stat-card rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Total P&L</div>
          <div className={`text-3xl font-bold ${stats.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {stats.total_profit >= 0 ? '+' : ''}${stats.total_profit.toFixed(2)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {((stats.total_profit / 500) * 100).toFixed(1)}% return
          </div>
        </div>
        
        <div className="stat-card rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Total Trades</div>
          <div className="text-3xl font-bold text-yellow-400">{stats.total_trades}</div>
          <div className="text-xs text-gray-500 mt-1">${stats.total_volume.toFixed(0)} volume</div>
        </div>
        
        <div className="stat-card rounded-xl p-6">
          <div className="text-gray-400 text-sm mb-1">Win Rate</div>
          <div className="text-3xl font-bold text-blue-400">{stats.win_rate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {stats.winning_trades}/{stats.total_trades} winning
          </div>
        </div>
      </div>

      {/* Charts and Holdings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* P&L Chart */}
        <div className="lg:col-span-2 stat-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pnlData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{ background: '#1a1a3e', border: '1px solid #333' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="portfolio" 
                  stroke="#FFCB05" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Current Holdings */}
        <div className="stat-card rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">
            Holdings ({holdings.length})
          </h2>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {holdings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No holdings yet</p>
            ) : (
              holdings.map((holding) => (
                <div key={holding.card_id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-12 h-16 bg-gray-700 rounded flex items-center justify-center text-2xl">
                    🃏
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{holding.card_name}</div>
                    <div className="text-xs text-gray-400">
                      Bought: ${holding.buy_price.toFixed(2)}
                    </div>
                    {holding.current_price && (
                      <div className={`text-xs ${holding.current_price >= holding.buy_price ? 'text-green-400' : 'text-red-400'}`}>
                        Now: ${holding.current_price.toFixed(2)} 
                        ({((holding.current_price - holding.buy_price) / holding.buy_price * 100).toFixed(1)}%)
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="stat-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
        <div className="space-y-2">
          {trades.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No trades yet - agent is scanning for opportunities...</p>
          ) : (
            trades.slice(0, 10).map((trade) => (
              <div 
                key={trade.id} 
                className={`p-4 rounded-lg bg-white/5 ${trade.type === 'buy' ? 'trade-buy' : 'trade-sell'}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {trade.type.toUpperCase()}
                    </span>
                    <span className="ml-3 font-medium">{trade.card_name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${trade.price_usd.toFixed(2)}</div>
                    {trade.profit_usd !== null && (
                      <div className={`text-sm ${trade.profit_usd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit_usd >= 0 ? '+' : ''}${trade.profit_usd.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(trade.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Platform: Courtyard.io (Polygon) | Agent: John's Swarm</p>
        <p className="mt-1">Trading is simulated until wallet is funded</p>
      </div>
    </main>
  );
}
