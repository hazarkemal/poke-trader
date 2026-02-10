'use client';

import { useState, useEffect, useCallback } from 'react';

const WALLET = '0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64';
const POKEMON_SPRITES = [
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png', // Charizard
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png', // Pikachu
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png', // Mewtwo
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/249.png', // Lugia
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/384.png', // Rayquaza
];

interface Stats {
  balance_usdc: number;
  balance_matic: number;
  total_trades: number;
  winning_trades: number;
  total_profit: number;
  portfolio_value: number;
  win_rate: number;
  status: string;
}

interface Trade {
  id: number;
  timestamp: string;
  type: 'buy' | 'sell';
  card_name: string;
  price_usd: number;
  profit_usd?: number;
  reasoning?: string;
}

interface Holding {
  card_id: string;
  card_name: string;
  buy_price: number;
  current_price?: number;
  pnl_pct?: number;
}

interface Intel {
  sentiment: string;
  trending: { card: string; score: number }[];
  recommendations: { action: string; card: string; reason: string; confidence: number }[];
  sources: { reddit: string[]; twitter: string[]; prices: string[] };
  lastScan: string;
}

interface ThoughtLog {
  timestamp: string;
  type: 'scan' | 'analysis' | 'decision' | 'trade' | 'learn';
  message: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    balance_usdc: 0, balance_matic: 0, total_trades: 0,
    winning_trades: 0, total_profit: 0, portfolio_value: 0,
    win_rate: 0, status: 'INITIALIZING'
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [intel, setIntel] = useState<Intel | null>(null);
  const [thoughts, setThoughts] = useState<ThoughtLog[]>([]);
  const [tab, setTab] = useState<'overview' | 'portfolio' | 'trades' | 'intel' | 'brain'>('overview');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, tradesRes, holdingsRes, intelRes] = await Promise.all([
        fetch('/api/stats'),
        fetch('/api/trades'),
        fetch('/api/holdings'),
        fetch('/api/intel')
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (tradesRes.ok) setTrades(await tradesRes.json());
      if (holdingsRes.ok) setHoldings(await holdingsRes.json());
      if (intelRes.ok) setIntel(await intelRes.json());
      setLastUpdate(new Date());
      
      // Simulate thought process
      addThought('scan', 'Scanning Reddit, Twitter, TCGPlayer for opportunities...');
    } catch (e) {
      console.log('Fetching...');
    }
  }, []);

  const addThought = (type: ThoughtLog['type'], message: string) => {
    setThoughts(prev => [{
      timestamp: new Date().toISOString(),
      type,
      message
    }, ...prev].slice(0, 50));
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    // Initial thoughts
    const initialThoughts: ThoughtLog[] = [
      { timestamp: new Date().toISOString(), type: 'scan', message: 'Initializing market scanners...' },
      { timestamp: new Date(Date.now() - 5000).toISOString(), type: 'analysis', message: 'Loading price history from TCGPlayer, eBay, PriceCharting' },
      { timestamp: new Date(Date.now() - 10000).toISOString(), type: 'decision', message: 'Strategy: Buy at 15%+ discount, sell at 10% profit' },
    ];
    setThoughts(initialThoughts);
  }, []);

  const getStatusBadge = () => {
    if (stats.balance_usdc > 10) return <span className="badge badge-online">● TRADING</span>;
    if (stats.status === 'SCANNING') return <span className="badge badge-scanning">◐ SCANNING</span>;
    return <span className="badge badge-offline">○ AWAITING FUNDS</span>;
  };

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-[var(--border)] bg-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={POKEMON_SPRITES[0]} 
                alt="Charizard" 
                className="w-10 h-10 pokemon-sprite"
              />
              <div>
                <h1 className="text-xl font-bold">PokeTrader</h1>
                <p className="text-xs text-[var(--text-muted)]">Autonomous Card Trading Agent</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {getStatusBadge()}
              <a 
                href="https://github.com/hazarkemal/poke-trader"
                target="_blank"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                GitHub →
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="border-b border-[var(--border)] bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="tabs">
            {(['overview', 'portfolio', 'trades', 'intel', 'brain'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`tab ${tab === t ? 'active' : ''}`}
              >
                {t === 'overview' && '📊'} 
                {t === 'portfolio' && '🎴'} 
                {t === 'trades' && '📜'} 
                {t === 'intel' && '🧠'} 
                {t === 'brain' && '💭'} 
                {' '}{t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <div className="card-header">
                  <span>📈</span> Performance
                </div>
                <div className="card-body">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="stat-box">
                      <div className="stat-value">${stats.balance_usdc.toFixed(2)}</div>
                      <div className="stat-label">Balance</div>
                    </div>
                    <div className="stat-box">
                      <div className={`stat-value ${stats.total_profit >= 0 ? 'text-[var(--accent-green)]' : 'text-[var(--accent)]'}`}>
                        {stats.total_profit >= 0 ? '+' : ''}${stats.total_profit.toFixed(2)}
                      </div>
                      <div className="stat-label">Total P&L</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{stats.total_trades}</div>
                      <div className="stat-label">Trades</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{stats.win_rate.toFixed(0)}%</div>
                      <div className="stat-label">Win Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <div className="card-header">
                  <span>⚡</span> Recent Activity
                </div>
                <div className="card-body p-0">
                  {trades.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                      <img src={POKEMON_SPRITES[1]} alt="Pikachu" className="w-16 h-16 mx-auto mb-4 pokemon-sprite opacity-50" />
                      <p>No trades yet</p>
                      <p className="text-sm">Waiting for wallet funding...</p>
                    </div>
                  ) : (
                    trades.slice(0, 5).map(trade => (
                      <div key={trade.id} className={`trade-row ${trade.type === 'buy' ? 'trade-buy' : 'trade-sell'}`}>
                        <div className="flex-1">
                          <div className="font-medium">{trade.card_name}</div>
                          <div className="text-sm text-[var(--text-muted)]">
                            {new Date(trade.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={trade.type === 'buy' ? 'text-[var(--accent-green)]' : 'text-[var(--accent)]'}>
                            {trade.type === 'buy' ? 'BUY' : 'SELL'} ${trade.price_usd.toFixed(2)}
                          </div>
                          {trade.profit_usd !== undefined && (
                            <div className={`text-sm ${trade.profit_usd >= 0 ? 'greentext' : 'redtext'}`}>
                              {trade.profit_usd >= 0 ? '+' : ''}${trade.profit_usd.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Wallet */}
              <div className="card">
                <div className="card-header">
                  <span>💳</span> Wallet
                </div>
                <div className="card-body">
                  <div className="mono text-xs break-all p-3 bg-[var(--bg-alt)] rounded mb-4">
                    {WALLET}
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-[var(--text-muted)]">USDC</span>
                    <span className="font-medium">${stats.balance_usdc.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-[var(--text-muted)]">MATIC (gas)</span>
                    <span className="font-medium">{stats.balance_matic.toFixed(4)}</span>
                  </div>
                  <a 
                    href={`https://polygonscan.com/address/${WALLET}`}
                    target="_blank"
                    className="block text-center py-2 border border-[var(--border)] rounded text-sm hover:bg-[var(--bg-alt)] transition"
                  >
                    View on PolygonScan →
                  </a>
                </div>
              </div>

              {/* Strategy */}
              <div className="card">
                <div className="card-header">
                  <span>🎯</span> Strategy
                </div>
                <div className="card-body text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Buy Threshold</span>
                    <span className="greentext font-medium">-15% below fair value</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Profit Target</span>
                    <span className="greentext font-medium">+10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Stop Loss</span>
                    <span className="redtext font-medium">-20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Max Position</span>
                    <span className="font-medium">$100/card</span>
                  </div>
                </div>
              </div>

              {/* Quick Intel */}
              {intel && (
                <div className="card">
                  <div className="card-header">
                    <span>🔥</span> Trending
                  </div>
                  <div className="card-body text-sm">
                    {intel.trending?.slice(0, 5).map((t, i) => (
                      <div key={i} className="flex justify-between py-1">
                        <span>{t.card || t}</span>
                        {t.score && <span className="text-[var(--text-muted)]">+{t.score}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {tab === 'portfolio' && (
          <div className="card">
            <div className="card-header">
              <span>🎴</span> Current Holdings ({holdings.length})
            </div>
            <div className="card-body">
              {holdings.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-muted)]">
                  <div className="flex justify-center gap-2 mb-4">
                    {POKEMON_SPRITES.slice(0, 3).map((src, i) => (
                      <img key={i} src={src} alt="" className="w-12 h-12 pokemon-sprite opacity-30" />
                    ))}
                  </div>
                  <p className="text-lg mb-2">No cards in portfolio</p>
                  <p className="text-sm">Fund the wallet to start catching deals!</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Buy Price</th>
                      <th>Current</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holdings.map(h => (
                      <tr key={h.card_id}>
                        <td className="font-medium">{h.card_name}</td>
                        <td className="mono">${h.buy_price.toFixed(2)}</td>
                        <td className="mono">${(h.current_price || h.buy_price).toFixed(2)}</td>
                        <td className={`mono ${(h.pnl_pct || 0) >= 0 ? 'greentext' : 'redtext'}`}>
                          {(h.pnl_pct || 0) >= 0 ? '+' : ''}{(h.pnl_pct || 0).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Trades Tab */}
        {tab === 'trades' && (
          <div className="card">
            <div className="card-header">
              <span>📜</span> Trade History
            </div>
            <div className="card-body p-0">
              {trades.length === 0 ? (
                <div className="p-12 text-center text-[var(--text-muted)]">
                  <p>No trades executed yet</p>
                </div>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Card</th>
                      <th>Price</th>
                      <th>P&L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map(t => (
                      <tr key={t.id}>
                        <td className="mono text-sm">{new Date(t.timestamp).toLocaleString()}</td>
                        <td>
                          <span className={`badge ${t.type === 'buy' ? 'badge-online' : 'badge-offline'}`}>
                            {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="font-medium">{t.card_name}</td>
                        <td className="mono">${t.price_usd.toFixed(2)}</td>
                        <td className={`mono ${(t.profit_usd || 0) >= 0 ? 'greentext' : 'redtext'}`}>
                          {t.profit_usd !== undefined ? `${t.profit_usd >= 0 ? '+' : ''}$${t.profit_usd.toFixed(2)}` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Intel Tab */}
        {tab === 'intel' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card">
              <div className="card-header">
                <span>📊</span> Market Sentiment
              </div>
              <div className="card-body">
                <div className={`text-3xl font-bold mb-4 ${
                  intel?.sentiment === 'bullish' ? 'text-[var(--accent-green)]' :
                  intel?.sentiment === 'bearish' ? 'text-[var(--accent)]' : 
                  'text-[var(--accent-gold)]'
                }`}>
                  {intel?.sentiment?.toUpperCase() || 'NEUTRAL'}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="font-medium mb-2">Data Sources:</div>
                  {intel?.sources?.reddit?.map((s, i) => (
                    <div key={i} className="text-[var(--text-muted)]">📰 {s}</div>
                  ))}
                  {intel?.sources?.prices?.map((s, i) => (
                    <div key={i} className="text-[var(--text-muted)]">💰 {s}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span>🎯</span> Recommendations
              </div>
              <div className="card-body">
                {intel?.recommendations?.map((rec, i) => (
                  <div key={i} className="p-3 border border-[var(--border)] rounded mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${
                        rec.action === 'buy' ? 'badge-online' : 
                        rec.action === 'sell' ? 'badge-offline' : 
                        'badge-scanning'
                      }`}>
                        {rec.action.toUpperCase()}
                      </span>
                      <span className="font-medium">{rec.card}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{rec.reason}</p>
                    {rec.confidence && (
                      <div className="mt-2">
                        <div className="text-xs text-[var(--text-muted)] mb-1">Confidence: {rec.confidence}%</div>
                        <div className="progress">
                          <div className="progress-fill" style={{ width: `${rec.confidence}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )) || <p className="text-[var(--text-muted)]">Analyzing market data...</p>}
              </div>
            </div>
          </div>
        )}

        {/* Brain Tab */}
        {tab === 'brain' && (
          <div className="card">
            <div className="card-header">
              <span>💭</span> Agent Thoughts
              <span className="ml-auto text-xs text-[var(--text-muted)]">
                Live feed of agent decision making
              </span>
            </div>
            <div className="card-body p-0 max-h-[600px] overflow-y-auto">
              {thoughts.map((t, i) => (
                <div key={i} className="log-entry px-4">
                  <span className="log-time">{new Date(t.timestamp).toLocaleTimeString()}</span>
                  <span className={`inline-block w-20 ${
                    t.type === 'scan' ? 'text-[var(--accent-blue)]' :
                    t.type === 'analysis' ? 'text-[var(--accent-gold)]' :
                    t.type === 'decision' ? 'text-[var(--accent-green)]' :
                    t.type === 'trade' ? 'text-[var(--accent)]' :
                    'text-purple-600'
                  }`}>
                    [{t.type.toUpperCase()}]
                  </span>
                  {t.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 pt-6 border-t border-[var(--border)] text-center text-sm text-[var(--text-muted)]">
          <div className="flex items-center justify-center gap-2 mb-2">
            {POKEMON_SPRITES.map((src, i) => (
              <img key={i} src={src} alt="" className="w-6 h-6 pokemon-sprite opacity-50" />
            ))}
          </div>
          <p>PokeTrader v1.0 • Open Source • Last updated: {lastUpdate.toLocaleTimeString()}</p>
          <p className="mt-1">Not financial advice. Trade at your own risk.</p>
        </footer>
      </div>
    </main>
  );
}
