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
  const [menu, setMenu] = useState(0);
  const [typing, setTyping] = useState('');
  const [fullText, setFullText] = useState('POKETRADER is scanning the market for rare cards...');

  // Typewriter effect
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTyping(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [fullText]);

  // Update status text based on state
  useEffect(() => {
    if (stats.balance_usdc > 10) {
      setFullText('POKETRADER is actively hunting for undervalued cards!');
    } else if (stats.total_trades > 0) {
      setFullText(`Completed ${stats.total_trades} trades. Win rate: ${stats.win_rate}%`);
    } else {
      setFullText('Waiting for trainer to deposit funds... Send USDC to wallet!');
    }
  }, [stats]);

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
      } catch (e) {}
    };
    fetchData();
    const i = setInterval(fetchData, 10000);
    return () => clearInterval(i);
  }, []);

  const menuItems = ['STATUS', 'POKEMON', 'TRADES', 'ABOUT'];

  return (
    <main className="min-h-screen p-4 no-select" style={{ background: '#9bbc0f' }}>
      {/* Game Boy Header */}
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4">
          <div className="text-xs tracking-widest mb-1">◄ POKEMON ►</div>
          <h1 className="text-base">POKETRADER</h1>
          <div className="text-[8px] mt-1">AUTONOMOUS CARD TRADER v1.0</div>
        </div>

        {/* Main Screen */}
        <div className="gb-screen p-4 mb-4">
          {/* Status Bar */}
          <div className="flex justify-between items-center mb-4 pb-2 border-b-4 border-[#0f380f]">
            <div className="flex items-center gap-2">
              <span className="status-online text-[8px]">ONLINE</span>
            </div>
            <div className="text-[8px]">
              ${stats.balance_usdc.toFixed(2)} USDC
            </div>
          </div>

          {/* Menu */}
          <div className="flex gap-2 mb-4">
            {menuItems.map((item, i) => (
              <button
                key={item}
                onClick={() => setMenu(i)}
                className={`pixel-btn text-[8px] ${menu === i ? 'bg-[#306230] text-[#9bbc0f]' : ''}`}
              >
                {menu === i && <span className="menu-arrow"></span>}
                {item}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="pokemon-box min-h-[300px]">
            {menu === 0 && (
              <div className="space-y-4">
                <div className="text-[10px] border-b-2 border-[#306230] pb-2 mb-4">
                  ┌─────────────────────┐<br/>
                  │    TRAINER CARD     │<br/>
                  └─────────────────────┘
                </div>
                
                <div className="stat-row">
                  <span className="stat-label">FUNDS</span>
                  <span className="stat-value">${stats.balance_usdc.toFixed(2)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">GAS</span>
                  <span className="stat-value">{stats.balance_matic.toFixed(4)} MATIC</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">TRADES</span>
                  <span className="stat-value">{stats.total_trades}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">WINS</span>
                  <span className="stat-value">{stats.winning_trades}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">WIN RATE</span>
                  <span className="stat-value">{stats.win_rate.toFixed(0)}%</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">PROFIT</span>
                  <span className={`stat-value ${stats.total_profit >= 0 ? '' : 'text-red-800'}`}>
                    {stats.total_profit >= 0 ? '+' : ''}${stats.total_profit.toFixed(2)}
                  </span>
                </div>

                {/* HP Bar style for portfolio health */}
                <div className="mt-4">
                  <div className="text-[8px] mb-1">PORTFOLIO HP</div>
                  <div className="hp-bar">
                    <div 
                      className={`hp-bar-fill ${stats.balance_usdc > 400 ? 'high' : stats.balance_usdc > 200 ? 'medium' : 'low'}`}
                      style={{ width: `${Math.min((stats.balance_usdc / 500) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {menu === 1 && (
              <div>
                <div className="text-[10px] border-b-2 border-[#306230] pb-2 mb-4">
                  ┌─────────────────────┐<br/>
                  │   POKEMON (CARDS)   │<br/>
                  └─────────────────────┘
                </div>
                
                {holdings.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-[32px] mb-4">�Pokemon</div>
                    <div className="text-[10px]">No POKEMON in party!</div>
                    <div className="text-[8px] mt-2">Deposit funds to catch em all!</div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {holdings.map((h, i) => (
                      <div key={h.card_id} className="card-frame">
                        <div className="card-inner">
                          <div className="flex justify-between">
                            <span>{h.card_name}</span>
                            <span>${h.buy_price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {menu === 2 && (
              <div>
                <div className="text-[10px] border-b-2 border-[#306230] pb-2 mb-4">
                  ┌─────────────────────┐<br/>
                  │    TRADE HISTORY    │<br/>
                  └─────────────────────┘
                </div>
                
                {trades.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-[10px]">No trades yet!</div>
                    <div className="text-[8px] mt-2">Agent is scanning markets...</div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {trades.slice(0, 10).map((t) => (
                      <div 
                        key={t.id} 
                        className={`p-2 ${t.type === 'buy' ? 'trade-buy' : 'trade-sell'}`}
                      >
                        <div className="flex justify-between text-[8px]">
                          <span>{t.type.toUpperCase()}</span>
                          <span>${t.price_usd.toFixed(2)}</span>
                        </div>
                        <div className="text-[10px]">{t.card_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {menu === 3 && (
              <div>
                <div className="text-[10px] border-b-2 border-[#306230] pb-2 mb-4">
                  ┌─────────────────────┐<br/>
                  │       ABOUT         │<br/>
                  └─────────────────────┘
                </div>
                
                <div className="space-y-4 text-[8px]">
                  <p>POKETRADER is an autonomous AI agent that hunts for undervalued Pokemon cards.</p>
                  
                  <div className="pokemon-box">
                    <div className="text-[10px] mb-2">STRATEGY:</div>
                    <div>• BUY at 15%+ discount</div>
                    <div>• SELL at 10% profit</div>
                    <div>• STOP LOSS at 20%</div>
                  </div>
                  
                  <div className="pokemon-box">
                    <div className="text-[10px] mb-2">SOURCES:</div>
                    <div>• Reddit communities</div>
                    <div>• Twitter sentiment</div>
                    <div>• TCGPlayer prices</div>
                    <div>• eBay sold data</div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <a 
                      href="https://github.com/hazarkemal/poke-trader"
                      target="_blank"
                      className="pixel-btn text-[8px]"
                    >
                      GITHUB
                    </a>
                    <a 
                      href={`https://polygonscan.com/address/${WALLET}`}
                      target="_blank"
                      className="pixel-btn text-[8px]"
                    >
                      WALLET
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Dialog Box */}
          <div className="pokemon-box mt-4">
            <div className="text-[10px] min-h-[40px]">
              {typing}<span className="blink">▼</span>
            </div>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="pokemon-box text-center">
          <div className="text-[8px] mb-2">DEPOSIT ADDRESS (POLYGON)</div>
          <div className="text-[6px] break-all bg-[#8bac0f] p-2 border-2 border-[#0f380f]">
            {WALLET}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-[6px]">
          <div>© 2026 POKETRADER • OPEN SOURCE</div>
          <div className="mt-1">NOT FINANCIAL ADVICE • TRADE AT YOUR OWN RISK</div>
        </div>
      </div>
    </main>
  );
}
