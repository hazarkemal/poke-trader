'use client';

import { useState, useEffect } from 'react';

const WALLET = '0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64';

interface Stats {
  balance_usdc: number;
  balance_matic: number;
  total_trades: number;
  winning_trades: number;
  total_profit: number;
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
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    balance_usdc: 0, balance_matic: 0, total_trades: 0,
    winning_trades: 0, total_profit: 0, win_rate: 0, status: 'SCANNING'
  });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [tab, setTab] = useState<'status' | 'pokemon' | 'bag' | 'brain'>('status');
  const [message, setMessage] = useState('');
  const [fullMessage] = useState('POKETRADER is scanning markets for rare cards...');
  const [msgIndex, setMsgIndex] = useState(0);

  // Typewriter effect
  useEffect(() => {
    if (msgIndex < fullMessage.length) {
      const timer = setTimeout(() => {
        setMessage(fullMessage.slice(0, msgIndex + 1));
        setMsgIndex(i => i + 1);
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [msgIndex, fullMessage]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, t, h] = await Promise.all([
          fetch('/api/stats').then(r => r.json()),
          fetch('/api/trades').then(r => r.json()),
          fetch('/api/holdings').then(r => r.json())
        ]);
        setStats(s);
        setTrades(t);
        setHoldings(h);
      } catch {}
    };
    fetchData();
    const i = setInterval(fetchData, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <main className="min-h-screen p-4 scanlines">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="pixel-header mb-6">
          <img 
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/6.png"
            alt="Charizard"
            className="w-12 h-12 pokemon-sprite"
          />
          <div>
            <h1 className="text-sm text-white">POKETRADER</h1>
            <p className="text-[9px] text-red-200">AUTONOMOUS CARD HUNTER v1.0</p>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className={`pixel-badge ${stats.balance_usdc > 0 ? 'online' : 'warning'}`}>
              {stats.balance_usdc > 0 ? '● HUNTING' : '◐ WAITING'}
            </span>
          </div>
        </div>

        {/* Main Window */}
        <div className="poke-window mb-6">
          <div className="poke-window-title">
            ═══════════════════ TRAINER DASHBOARD ═══════════════════
          </div>
          
          {/* Tabs */}
          <div className="pixel-tabs">
            {[
              { id: 'status', label: 'STATUS', icon: '📊' },
              { id: 'pokemon', label: 'POKEMON', icon: '🎴' },
              { id: 'bag', label: 'BAG', icon: '🎒' },
              { id: 'brain', label: 'BRAIN', icon: '🧠' }
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`pixel-btn text-[11px] ${tab === t.id ? 'active' : ''}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4">
            
            {/* Status Tab */}
            {tab === 'status' && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-display">
                    <div className="stat-value">${stats.balance_usdc.toFixed(2)}</div>
                    <div className="stat-label">POKÉDOLLARS</div>
                  </div>
                  <div className="stat-display">
                    <div className="stat-value" style={{ color: stats.total_profit >= 0 ? 'var(--secondary)' : 'var(--danger)' }}>
                      {stats.total_profit >= 0 ? '+' : ''}{stats.total_profit.toFixed(2)}
                    </div>
                    <div className="stat-label">PROFIT</div>
                  </div>
                  <div className="stat-display">
                    <div className="stat-value">{stats.total_trades}</div>
                    <div className="stat-label">TRADES</div>
                  </div>
                  <div className="stat-display">
                    <div className="stat-value">{stats.win_rate.toFixed(0)}%</div>
                    <div className="stat-label">WIN RATE</div>
                  </div>
                </div>

                {/* HP Bar */}
                <div className="pixel-box p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px]">PORTFOLIO HP</span>
                    <span className="text-[11px] text-[var(--primary)]">
                      ${stats.balance_usdc.toFixed(0)}/500
                    </span>
                  </div>
                  <div className="pixel-progress">
                    <div 
                      className="pixel-progress-fill"
                      style={{ width: `${Math.min((stats.balance_usdc / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recent Trades */}
                <div className="pixel-box">
                  <div className="p-3 border-b-2 border-[var(--border)]">
                    <span className="text-[11px] text-[var(--primary)]">▶ RECENT BATTLES</span>
                  </div>
                  <div className="p-2">
                    {trades.length === 0 ? (
                      <div className="text-center py-6 text-[var(--text-muted)]">
                        <div className="text-2xl mb-2">🎴</div>
                        <p className="text-[11px]">No trades yet!</p>
                        <p className="text-[9px]">Deposit funds to start hunting</p>
                      </div>
                    ) : (
                      trades.slice(0, 5).map(t => (
                        <div key={t.id} className={`trade-entry ${t.type}`}>
                          <div className="flex justify-between">
                            <span className="text-[11px]">{t.type.toUpperCase()}</span>
                            <span className="text-[11px]">${t.price_usd.toFixed(2)}</span>
                          </div>
                          <div className="text-[13px] text-[var(--primary)]">{t.card_name}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pokemon Tab */}
            {tab === 'pokemon' && (
              <div className="pixel-box p-4">
                <div className="text-center mb-4">
                  <span className="text-[11px] text-[var(--primary)]">▶ CARD COLLECTION</span>
                </div>
                {holdings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="flex justify-center gap-2 mb-4">
                      {[25, 6, 150].map(id => (
                        <img 
                          key={id}
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                          className="w-16 h-16 pokemon-sprite opacity-30"
                          alt=""
                        />
                      ))}
                    </div>
                    <p className="text-[13px] text-[var(--text-muted)]">Your party is empty!</p>
                    <p className="text-[11px] text-[var(--text-muted)]">Deposit USDC to catch cards</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {holdings.map(h => (
                      <div key={h.card_id} className="card-frame">
                        <div className="card-inner text-center">
                          <div className="text-[13px] text-[var(--primary)]">{h.card_name}</div>
                          <div className="text-[11px] text-[var(--text-muted)]">
                            ${h.buy_price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Bag Tab */}
            {tab === 'bag' && (
              <div className="pixel-box p-4">
                <div className="text-center mb-4">
                  <span className="text-[11px] text-[var(--primary)]">▶ TRAINER BAG</span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-[var(--bg)] border-2 border-[var(--border)]">
                    <span className="text-[11px]">💰 USDC</span>
                    <span className="text-[13px] text-[var(--primary)]">${stats.balance_usdc.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--bg)] border-2 border-[var(--border)]">
                    <span className="text-[11px]">⛽ MATIC</span>
                    <span className="text-[13px] text-[var(--primary)]">{stats.balance_matic.toFixed(4)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[var(--bg)] border-2 border-[var(--border)]">
                    <span className="text-[11px]">🎴 CARDS</span>
                    <span className="text-[13px] text-[var(--primary)]">{holdings.length}</span>
                  </div>
                  
                  <div className="mt-6 p-3 bg-[var(--bg)] border-2 border-[var(--border)]">
                    <div className="text-[9px] text-[var(--text-muted)] mb-2">WALLET ADDRESS</div>
                    <div className="text-[9px] break-all text-[var(--primary)]">{WALLET}</div>
                  </div>
                  
                  <a 
                    href={`https://polygonscan.com/address/${WALLET}`}
                    target="_blank"
                    className="pixel-btn block text-center text-[11px]"
                  >
                    VIEW ON POLYGONSCAN →
                  </a>
                </div>
              </div>
            )}

            {/* Brain Tab */}
            {tab === 'brain' && (
              <div className="pixel-box p-4">
                <div className="text-center mb-4">
                  <span className="text-[11px] text-[var(--primary)]">▶ AGENT THOUGHTS</span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {[
                    { time: '02:28', type: 'SCAN', msg: 'Checking r/PokemonTCG...' },
                    { time: '02:27', type: 'ANALYSIS', msg: 'Charizard VMAX: 8% below fair value' },
                    { time: '02:26', type: 'DECISION', msg: 'Need 15%+ discount to buy' },
                    { time: '02:25', type: 'SCAN', msg: 'Monitoring TCGPlayer prices...' },
                    { time: '02:24', type: 'LEARN', msg: 'No trades yet - building knowledge' },
                  ].map((t, i) => (
                    <div key={i} className="p-2 bg-[var(--bg)] border border-[var(--border)] text-[11px]">
                      <span className="text-[var(--text-muted)]">[{t.time}]</span>
                      <span className={`ml-2 ${
                        t.type === 'SCAN' ? 'text-[var(--info)]' :
                        t.type === 'ANALYSIS' ? 'text-[var(--primary)]' :
                        t.type === 'DECISION' ? 'text-[var(--secondary)]' :
                        'text-purple-400'
                      }`}>[{t.type}]</span>
                      <span className="ml-2">{t.msg}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pixel-box p-3">
                  <div className="text-[9px] text-[var(--text-muted)] mb-2">STRATEGY</div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-[var(--secondary)] text-[13px]">-15%</div>
                      <div className="text-[9px] text-[var(--text-muted)]">BUY</div>
                    </div>
                    <div>
                      <div className="text-[var(--primary)] text-[13px]">+10%</div>
                      <div className="text-[9px] text-[var(--text-muted)]">SELL</div>
                    </div>
                    <div>
                      <div className="text-[var(--danger)] text-[13px]">-20%</div>
                      <div className="text-[9px] text-[var(--text-muted)]">STOP</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Box */}
        <div className="message-box">
          <span className="text-[13px]">{message}</span>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex justify-center gap-2 mb-2">
            {[6, 25, 150, 249, 384].map(id => (
              <img 
                key={id}
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                className="w-8 h-8 pokemon-sprite opacity-50"
                alt=""
              />
            ))}
          </div>
          <p className="text-[9px] text-[var(--text-muted)]">
            POKETRADER v1.0 • 
            <a href="https://github.com/hazarkemal/poke-trader" target="_blank" className="text-[var(--info)]"> GITHUB</a> • 
            OPEN SOURCE
          </p>
        </div>
      </div>
    </main>
  );
}
