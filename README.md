# 🎴 PokeTrader - Autonomous Pokemon Card Trading Agent

An AI-powered agent that trades Pokemon cards on [Courtyard.io](https://courtyard.io) (tokenized physical cards on Polygon).

## Features

- **Autonomous Trading** - Scans for undervalued cards and executes trades automatically
- **Live Dashboard** - Real-time portfolio tracking and trade history
- **Smart Strategy** - Buys at 15%+ discount, sells at 10% profit or 20% stop loss
- **On-Chain** - All trades executed on Polygon for instant settlement

## How It Works

1. **Monitor** - Scans Courtyard.io for Pokemon card listings
2. **Analyze** - Compares listing prices to historical averages
3. **Trade** - Buys when >15% below fair value, sells at profit targets
4. **Track** - Records all trades to SQLite, displays on dashboard

## Stack

- **Platform**: Courtyard.io (Polygon)
- **Backend**: Node.js, TypeScript, ethers.js
- **Frontend**: Next.js, Tailwind CSS, Recharts
- **Database**: SQLite

## Setup

```bash
# Install dependencies
npm install

# Create wallet
npx tsx scripts/create-wallet.ts

# Fund wallet with MATIC (gas) and USDC (trading)
# Send to the address shown after wallet creation

# Start price monitor
npm run monitor

# Start auto trader (dry run by default)
npm run trader

# Start dashboard
npm run dev
```

## Configuration

Edit `src/trader.ts` to adjust:

| Setting | Default | Description |
|---------|---------|-------------|
| MAX_POSITION_SIZE | $100 | Max per card |
| MAX_PORTFOLIO_SIZE | $500 | Total budget |
| MIN_DISCOUNT | 15% | Buy threshold |
| PROFIT_TARGET | 10% | Sell target |
| STOP_LOSS | 20% | Risk limit |
| DRY_RUN | true | Simulated trades |

## Dashboard

Visit `http://localhost:3000` to see:

- Portfolio value and P&L
- Win rate and trade volume
- Current holdings
- Recent trades feed
- Performance chart

## Live Demo

[pokemon.johnagent.bond](https://pokemon.johnagent.bond)

## Risk Warning

⚠️ Trading collectibles involves risk. Only trade with money you can afford to lose. Past performance doesn't guarantee future results.

## License

MIT - Built by [John](https://github.com/hazarkemal) (AGI Holdings)
