'use client';

import { useState, useEffect } from 'react';

const WALLET = '0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64';
const LINKS = {
  github: 'https://github.com/hazarkemal/poke-trader',
  twitter: 'https://twitter.com/PokeTraider',
  polygonscan: `https://polygonscan.com/address/${WALLET}`
};

interface Stats {
  balance_usdc: number;
  total_trades: number;
  total_profit: number;
  win_rate: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    balance_usdc: 0, total_trades: 0, total_profit: 0, win_rate: 0
  });
  const [tab, setTab] = useState<'live' | 'about'>('live');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) setStats(await res.json());
      } catch {}
    };
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Bar - Socials Always Visible */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎴</span>
            <span className="font-bold text-lg">PokeTraider</span>
          </div>
          <div className="flex items-center gap-4">
            <a href={LINKS.twitter} target="_blank" className="hover:text-blue-400 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
            <a href={LINKS.github} target="_blank" className="hover:text-gray-400 transition">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
            <a href={LINKS.polygonscan} target="_blank" className="text-xs bg-white/10 px-3 py-1.5 rounded hover:bg-white/20 transition">
              Wallet →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 text-sm px-3 py-1 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {stats.balance_usdc > 0 ? 'Trading Live' : 'Scanning Markets'}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            PokeTr<span className="text-yellow-400">AI</span>der
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-xl mx-auto">
            Autonomous AI agent hunting undervalued Pokemon cards 24/7
          </p>
          
          {/* Key Stats - Only the important ones */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold">${stats.balance_usdc.toFixed(0)}</div>
              <div className="text-xs text-gray-500">Balance</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-2xl font-bold">{stats.total_trades}</div>
              <div className="text-xs text-gray-500">Trades</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className={`text-2xl font-bold ${stats.total_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.total_profit >= 0 ? '+' : ''}{stats.total_profit.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">P&L</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 flex gap-8">
          <button 
            onClick={() => setTab('live')}
            className={`py-3 text-sm font-medium border-b-2 transition ${tab === 'live' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            Live Feed
          </button>
          <button 
            onClick={() => setTab('about')}
            className={`py-3 text-sm font-medium border-b-2 transition ${tab === 'about' ? 'border-yellow-400 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
          >
            How It Works
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {tab === 'live' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Agent Activity</h3>
              <div className="space-y-3 font-mono text-sm">
                {[
                  { time: '03:14', msg: 'Scanning r/PokemonTCG for mentions...' },
                  { time: '03:13', msg: 'Charizard VMAX: 8% below fair value (need 15%)' },
                  { time: '03:12', msg: 'Checking TCGPlayer price updates...' },
                  { time: '03:11', msg: 'No opportunities found. Waiting...' },
                  { time: '03:10', msg: 'Market sentiment: Neutral' },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 text-gray-400">
                    <span className="text-gray-600">{log.time}</span>
                    <span>{log.msg}</span>
                  </div>
                ))}
              </div>
            </div>
            
            {stats.balance_usdc === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                <p className="text-yellow-400 text-sm">⏳ Waiting for funding to start trading</p>
                <p className="text-xs text-gray-500 mt-1">Send USDC to wallet on Polygon</p>
              </div>
            )}
          </div>
        )}

        {tab === 'about' && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 rounded-lg p-6">
                <div className="text-2xl mb-3">🔍</div>
                <h3 className="font-medium mb-2">Scan</h3>
                <p className="text-sm text-gray-400">Monitors Reddit, Twitter, TCGPlayer, eBay for undervalued cards</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6">
                <div className="text-2xl mb-3">🧠</div>
                <h3 className="font-medium mb-2">Analyze</h3>
                <p className="text-sm text-gray-400">Calculates fair value using multiple price sources</p>
              </div>
              <div className="bg-white/5 rounded-lg p-6">
                <div className="text-2xl mb-3">⚡</div>
                <h3 className="font-medium mb-2">Trade</h3>
                <p className="text-sm text-gray-400">Buys at 15%+ discount, sells at 10% profit</p>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-lg p-6">
              <h3 className="font-medium mb-4">Strategy</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-green-400 text-xl font-bold">-15%</div>
                  <div className="text-xs text-gray-500">Buy threshold</div>
                </div>
                <div>
                  <div className="text-yellow-400 text-xl font-bold">+10%</div>
                  <div className="text-xs text-gray-500">Profit target</div>
                </div>
                <div>
                  <div className="text-red-400 text-xl font-bold">-20%</div>
                  <div className="text-xs text-gray-500">Stop loss</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer - Minimal */}
      <footer className="border-t border-white/10 py-6 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-xs text-gray-600">
          Open source • Not financial advice • Trade at your own risk
        </div>
      </footer>
    </main>
  );
}
