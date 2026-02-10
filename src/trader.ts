#!/usr/bin/env tsx
/**
 * Pokemon Card Trading Agent - Auto Trader
 * Executes trades when opportunities meet criteria
 */

import { ethers } from 'ethers';
import { getOrCreateWallet, getProvider, getSigner } from './lib/wallet';
import { recordTrade, addHolding, removeHolding, getHoldings, getStats } from './lib/database';
import { getListings, getPriceHistory } from './lib/courtyard';

// Trading parameters
const CONFIG = {
  MAX_POSITION_SIZE: 100,    // Max $100 per card
  MAX_PORTFOLIO_SIZE: 500,   // Total $500 budget
  MIN_DISCOUNT: 0.15,        // 15% minimum discount to buy
  PROFIT_TARGET: 0.10,       // 10% profit target to sell
  STOP_LOSS: 0.20,           // 20% stop loss
  DRY_RUN: true              // Set to false for live trading
};

interface TradeDecision {
  action: 'buy' | 'sell' | 'hold';
  reason: string;
  cardId?: string;
  cardName?: string;
  price?: number;
  targetPrice?: number;
}

async function checkBalance(): Promise<{ matic: number; usdc: number }> {
  const wallet = getOrCreateWallet();
  const provider = getProvider();
  
  const maticBalance = await provider.getBalance(wallet.address);
  // USDC on Polygon
  const usdcContract = new ethers.Contract(
    '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC on Polygon
    ['function balanceOf(address) view returns (uint256)'],
    provider
  );
  
  try {
    const usdcBalance = await usdcContract.balanceOf(wallet.address);
    return {
      matic: parseFloat(ethers.formatEther(maticBalance)),
      usdc: parseFloat(ethers.formatUnits(usdcBalance, 6))
    };
  } catch {
    return { matic: parseFloat(ethers.formatEther(maticBalance)), usdc: 0 };
  }
}

async function evaluateBuyOpportunity(card: any, priceData: any): Promise<TradeDecision> {
  const stats = getStats();
  const holdings = getHoldings();
  
  // Check if we already hold this card
  if (holdings.find((h: any) => h.card_id === card.id)) {
    return { action: 'hold', reason: 'Already holding this card' };
  }
  
  // Check portfolio limits
  if (stats.portfolio_value >= CONFIG.MAX_PORTFOLIO_SIZE) {
    return { action: 'hold', reason: 'Portfolio at max size' };
  }
  
  // Check position size
  if (card.price > CONFIG.MAX_POSITION_SIZE) {
    return { action: 'hold', reason: 'Price exceeds max position size' };
  }
  
  // Calculate discount
  const discount = (priceData.avgPrice - card.price) / priceData.avgPrice;
  
  if (discount < CONFIG.MIN_DISCOUNT) {
    return { action: 'hold', reason: `Discount ${(discount * 100).toFixed(1)}% below threshold` };
  }
  
  return {
    action: 'buy',
    reason: `${(discount * 100).toFixed(1)}% discount detected`,
    cardId: card.id,
    cardName: card.name,
    price: card.price,
    targetPrice: card.price * (1 + CONFIG.PROFIT_TARGET)
  };
}

async function evaluateSellOpportunity(holding: any, currentPrice: number): Promise<TradeDecision> {
  const profitPct = (currentPrice - holding.buy_price) / holding.buy_price;
  
  // Check profit target
  if (profitPct >= CONFIG.PROFIT_TARGET) {
    return {
      action: 'sell',
      reason: `Profit target reached: ${(profitPct * 100).toFixed(1)}%`,
      cardId: holding.card_id,
      cardName: holding.card_name,
      price: currentPrice
    };
  }
  
  // Check stop loss
  if (profitPct <= -CONFIG.STOP_LOSS) {
    return {
      action: 'sell',
      reason: `Stop loss triggered: ${(profitPct * 100).toFixed(1)}%`,
      cardId: holding.card_id,
      cardName: holding.card_name,
      price: currentPrice
    };
  }
  
  return { action: 'hold', reason: 'Within trading range' };
}

async function executeBuy(decision: TradeDecision): Promise<boolean> {
  console.log(`\n🛒 EXECUTING BUY: ${decision.cardName}`);
  console.log(`   Price: $${decision.price}`);
  console.log(`   Reason: ${decision.reason}`);
  
  if (CONFIG.DRY_RUN) {
    console.log('   [DRY RUN - No actual trade executed]');
    
    // Record simulated trade
    recordTrade({
      type: 'buy',
      cardId: decision.cardId!,
      cardName: decision.cardName!,
      priceUsd: decision.price!,
      notes: `[SIMULATED] ${decision.reason}`
    });
    
    addHolding({
      cardId: decision.cardId!,
      cardName: decision.cardName!,
      buyPrice: decision.price!
    });
    
    return true;
  }
  
  // TODO: Implement actual Courtyard buy transaction
  // This would involve interacting with their smart contracts
  
  return false;
}

async function executeSell(decision: TradeDecision): Promise<boolean> {
  console.log(`\n💰 EXECUTING SELL: ${decision.cardName}`);
  console.log(`   Price: $${decision.price}`);
  console.log(`   Reason: ${decision.reason}`);
  
  if (CONFIG.DRY_RUN) {
    console.log('   [DRY RUN - No actual trade executed]');
    
    // Record simulated trade
    recordTrade({
      type: 'sell',
      cardId: decision.cardId!,
      cardName: decision.cardName!,
      priceUsd: decision.price!,
      notes: `[SIMULATED] ${decision.reason}`
    });
    
    removeHolding(decision.cardId!);
    
    return true;
  }
  
  // TODO: Implement actual Courtyard sell transaction
  
  return false;
}

async function runTradingCycle() {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🤖 Trading Cycle - ${new Date().toISOString()}`);
  console.log('='.repeat(50));
  
  // Check balance
  const balance = await checkBalance();
  console.log(`💰 Balance: ${balance.matic.toFixed(4)} MATIC | $${balance.usdc.toFixed(2)} USDC`);
  
  // Get current holdings
  const holdings = getHoldings();
  console.log(`📦 Holdings: ${holdings.length} cards`);
  
  // Get stats
  const stats = getStats();
  console.log(`📊 Total Trades: ${stats.total_trades} | Win Rate: ${stats.win_rate}%`);
  
  // Check sell opportunities for current holdings
  for (const holding of holdings) {
    const priceData = await getPriceHistory(holding.card_id);
    if (!priceData) continue;
    
    const decision = await evaluateSellOpportunity(holding, priceData.lastSale);
    if (decision.action === 'sell') {
      await executeSell(decision);
    }
  }
  
  // Check buy opportunities
  const listings = await getListings('pokemon', 100);
  for (const card of listings.slice(0, 20)) { // Check top 20
    const priceData = await getPriceHistory(card.id);
    if (!priceData) continue;
    
    const decision = await evaluateBuyOpportunity(card, priceData);
    if (decision.action === 'buy') {
      await executeBuy(decision);
    }
  }
}

async function main() {
  console.log('🎴 Pokemon Card Trading Agent - Auto Trader');
  console.log('='.repeat(50));
  
  const wallet = getOrCreateWallet();
  console.log(`💳 Wallet: ${wallet.address}`);
  console.log(`⚙️  Mode: ${CONFIG.DRY_RUN ? 'DRY RUN (simulated)' : 'LIVE TRADING'}`);
  console.log(`💰 Max Position: $${CONFIG.MAX_POSITION_SIZE}`);
  console.log(`🎯 Profit Target: ${CONFIG.PROFIT_TARGET * 100}%`);
  console.log(`🛑 Stop Loss: ${CONFIG.STOP_LOSS * 100}%`);
  
  // Run initial cycle
  await runTradingCycle();
  
  // Continue trading every 5 minutes
  setInterval(runTradingCycle, 5 * 60 * 1000);
}

main().catch(console.error);
