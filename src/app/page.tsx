'use client';

import { useState, useEffect } from 'react';

// Agent Identity
const AGENT = {
  name: "PokeTrader",
  version: "1.0.0",
  wallet: "0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64",
  network: "Polygon",
  github: "https://github.com/hazarkemal/poke-trader",
  twitter: "https://twitter.com/PokeTraderAgent",
  createdAt: "2026-02-10",
  strategy: "Buy 15%+ undervalued, sell at 10% profit"
};

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
}

interface Holding {
  card_id: string;
  card_name: string;
  buy_price: number;
  current_price?: number;
}

interface Intel {
  sentiment: string;
  trending: string[];
  recommendations: { action: string; card: string; reason: string }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    balance_usdc: 0,
    balance_matic: 0,
    total_trades: 0,
    winning_trades: 0,
    total_profit: 0,
    portfolio_value: 0,
    win_rate: 0,
    status: 'SCANNING'
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [intel, setIntel] = useState<Intel>({ sentiment: 'neutral', trending: [], recommendations: [] });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'stats' | 'trades' | 'intel' | 'about'>('stats');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
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
      } catch (e) {
        console.log('Fetching data...');
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen p-4 md:p-8 pokeball-bg crt-effect">
      {/* Header */}
      <header className="retro-card p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl">🎴</div>
            <div>
              <h1 className="pixel-font text-2xl md:text-3xl text-yellow-400">
                POKETRADER
              </h1>
              <p className="text-gray-400 text-lg">Autonomous Pokemon Card Trading Agent</p>
            </div>
          </div>
          <div className="text-right">
            <div className="pixel-font text-green-400 text-sm flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full blink"></span>
              {stats.status}
            </div>
            <div className="text-gray-500 text-sm font-mono">
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="flex gap-2 mb-6 flex-wrap">
        {['stats', 'trades', 'intel', 'about'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`pixel-font text-xs px-4 py-2 border-4 transition-all ${
              activeTab === tab
                ? 'bg-yellow-400 text-black border-yellow-600'
                : 'bg-gray-800 text-gray-400 border-gray-600 hover:border-yellow-400'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* Wallet Status */}
          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">💳 WALLET STATUS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-500 text-sm">USDC Balance</div>
                <div className="stat-value text-2xl">${stats.balance_usdc.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">MATIC (Gas)</div>
                <div className="stat-value text-2xl">{stats.balance_matic.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Portfolio Value</div>
                <div className="stat-value text-2xl">${stats.portfolio_value.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Total P&L</div>
                <div className={`stat-value text-2xl ${stats.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.total_profit >= 0 ? '+' : ''}${stats.total_profit.toFixed(2)}
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-black/30 border border-gray-700">
              <code className="text-xs text-gray-400 break-all">{AGENT.wallet}</code>
            </div>
          </div>

          {/* Trading Stats */}
          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">📊 TRADING STATS</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-500 text-sm">Total Trades</div>
                <div className="stat-value text-3xl">{stats.total_trades}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Winning Trades</div>
                <div className="stat-value text-3xl text-green-400">{stats.winning_trades}</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Win Rate</div>
                <div className="stat-value text-3xl">{stats.win_rate.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-gray-500 text-sm">Status</div>
                <div className="stat-value text-xl">
                  {stats.balance_usdc > 0 ? '🟢 ACTIVE' : '⏳ AWAITING FUNDS'}
                </div>
              </div>
            </div>
          </div>

          {/* Holdings */}
          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">🃏 CURRENT HOLDINGS ({holdings.length})</h2>
            {holdings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>No cards in portfolio yet</p>
                <p className="text-sm">Fund wallet to start trading</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {holdings.map((h) => (
                  <div key={h.card_id} className="pokemon-card-frame">
                    <div className="bg-gray-900 p-4">
                      <div className="text-white font-bold">{h.card_name}</div>
                      <div className="text-gray-400 text-sm">Bought: ${h.buy_price.toFixed(2)}</div>
                      {h.current_price && (
                        <div className={h.current_price >= h.buy_price ? 'text-green-400' : 'text-red-400'}>
                          Now: ${h.current_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trades Tab */}
      {activeTab === 'trades' && (
        <div className="retro-card p-6">
          <h2 className="pixel-font text-yellow-400 text-sm mb-4">📜 TRADE HISTORY</h2>
          {trades.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🔍</div>
              <p className="pixel-font text-sm">NO TRADES YET</p>
              <p className="mt-2">Agent is scanning for opportunities...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {trades.map((trade) => (
                <div
                  key={trade.id}
                  className={`trade-row p-4 ${trade.type === 'buy' ? 'trade-buy' : 'trade-sell'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className={`pixel-font text-xs px-2 py-1 ${
                        trade.type === 'buy' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="ml-3 text-white">{trade.card_name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">${trade.price_usd.toFixed(2)}</div>
                      {trade.profit_usd && (
                        <div className={trade.profit_usd >= 0 ? 'text-green-400' : 'text-red-400'}>
                          {trade.profit_usd >= 0 ? '+' : ''}${trade.profit_usd.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-500 text-xs mt-1">
                    {new Date(trade.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Intel Tab */}
      {activeTab === 'intel' && (
        <div className="space-y-6">
          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">🧠 MARKET INTELLIGENCE</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-gray-500 text-sm mb-2">Market Sentiment</div>
                <div className={`pixel-font text-xl ${
                  intel.sentiment === 'bullish' ? 'text-green-400' :
                  intel.sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {intel.sentiment?.toUpperCase() || 'SCANNING...'}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-2">Trending Cards</div>
                <div className="space-y-1">
                  {intel.trending?.slice(0, 3).map((card, i) => (
                    <div key={i} className="text-white">🔥 {card}</div>
                  )) || <div className="text-gray-500">Gathering data...</div>}
                </div>
              </div>
              <div>
                <div className="text-gray-500 text-sm mb-2">Data Sources</div>
                <div className="text-white space-y-1">
                  <div>📰 Reddit</div>
                  <div>🐦 Twitter</div>
                  <div>💰 TCGPlayer</div>
                </div>
              </div>
            </div>
          </div>

          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">🎯 RECOMMENDATIONS</h2>
            {intel.recommendations?.length > 0 ? (
              <div className="space-y-3">
                {intel.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-black/30 border border-gray-700">
                    <div className="flex items-center gap-2">
                      <span className={`pixel-font text-xs px-2 py-1 ${
                        rec.action === 'buy' ? 'bg-green-900 text-green-400' :
                        rec.action === 'sell' ? 'bg-red-900 text-red-400' :
                        'bg-yellow-900 text-yellow-400'
                      }`}>
                        {rec.action.toUpperCase()}
                      </span>
                      <span className="text-white">{rec.card}</span>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">{rec.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4">
                Analyzing market data...
              </div>
            )}
          </div>
        </div>
      )}

      {/* About Tab */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">🤖 ABOUT POKETRADER</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                PokeTrader is an <span className="text-yellow-400">autonomous AI agent</span> that 
                trades Pokemon cards on the blockchain. It scans multiple marketplaces, analyzes 
                community sentiment, and executes trades automatically.
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Version</div>
                  <div>{AGENT.version}</div>
                </div>
                <div>
                  <div className="text-gray-500">Network</div>
                  <div>{AGENT.network}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div>{AGENT.createdAt}</div>
                </div>
                <div>
                  <div className="text-gray-500">Strategy</div>
                  <div>{AGENT.strategy}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">⚙️ HOW IT WORKS</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <div className="text-white">Scan Markets</div>
                  <div className="text-sm text-gray-500">Monitors Courtyard, TCGPlayer, eBay for listings</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <div className="text-white">Analyze Value</div>
                  <div className="text-sm text-gray-500">Compares prices across sources, finds undervalued cards</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <div className="text-white">Execute Trades</div>
                  <div className="text-sm text-gray-500">Buys at 15%+ discount, sells at 10% profit target</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <div>
                  <div className="text-white">Learn & Adapt</div>
                  <div className="text-sm text-gray-500">Tracks community sentiment, adjusts strategy</div>
                </div>
              </div>
            </div>
          </div>

          <div className="retro-card p-6">
            <h2 className="pixel-font text-yellow-400 text-sm mb-4">🔗 LINKS</h2>
            <div className="flex flex-wrap gap-4">
              <a
                href={AGENT.github}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors"
              >
                <span>📂</span> GitHub (Open Source)
              </a>
              <a
                href={`https://polygonscan.com/address/${AGENT.wallet}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 transition-colors"
              >
                <span>🔍</span> View on PolygonScan
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>PokeTrader v{AGENT.version} • Powered by AI • Open Source</p>
        <p className="mt-1">Trading involves risk. Past performance ≠ future results.</p>
      </footer>
    </main>
  );
}
