#!/usr/bin/env tsx
/**
 * Pokemon Card Price Monitor
 * Scans Courtyard.io for undervalued cards
 */

import { getListings, getPriceHistory, findOpportunities, WATCHED_SETS } from './lib/courtyard';
import { getDb } from './lib/database';
import { getOrCreateWallet } from './lib/wallet';

const SCAN_INTERVAL = 60 * 1000; // 1 minute
const MIN_DISCOUNT = 0.15; // 15% minimum discount
const MAX_PRICE = 100; // Max $100 per card (with $500 budget)

interface Opportunity {
  cardId: string;
  cardName: string;
  listingPrice: number;
  fairValue: number;
  discount: number;
  image: string;
}

async function scanForOpportunities(): Promise<Opportunity[]> {
  console.log(`\n🔍 [${new Date().toISOString()}] Scanning for opportunities...`);
  
  const opportunities: Opportunity[] = [];
  
  for (const set of WATCHED_SETS.slice(0, 5)) { // Start with top 5 sets
    try {
      const listings = await getListings(set, 50);
      console.log(`  📦 ${set}: ${listings.length} listings`);
      
      for (const listing of listings) {
        if (listing.price > MAX_PRICE) continue;
        
        const priceData = await getPriceHistory(listing.id);
        if (!priceData) continue;
        
        const discount = (priceData.avgPrice - listing.price) / priceData.avgPrice;
        
        if (discount >= MIN_DISCOUNT) {
          opportunities.push({
            cardId: listing.id,
            cardName: listing.name,
            listingPrice: listing.price,
            fairValue: priceData.avgPrice,
            discount: discount * 100,
            image: listing.image
          });
          
          console.log(`  🎯 OPPORTUNITY: ${listing.name}`);
          console.log(`     Price: $${listing.price} | Fair: $${priceData.avgPrice.toFixed(2)} | Discount: ${(discount * 100).toFixed(1)}%`);
        }
      }
    } catch (error) {
      console.error(`  ❌ Error scanning ${set}:`, error);
    }
  }
  
  return opportunities.sort((a, b) => b.discount - a.discount);
}

async function saveOpportunities(opportunities: Opportunity[]) {
  const db = getDb();
  const timestamp = new Date().toISOString();
  
  for (const opp of opportunities) {
    db.prepare(`
      INSERT INTO price_history (card_id, price_usd, timestamp)
      VALUES (?, ?, ?)
    `).run(opp.cardId, opp.listingPrice, timestamp);
  }
}

async function main() {
  console.log('🎴 Pokemon Card Trading Agent - Price Monitor');
  console.log('='.repeat(50));
  
  // Initialize wallet
  const wallet = getOrCreateWallet();
  console.log(`💳 Wallet: ${wallet.address}`);
  console.log(`⚙️  Min Discount: ${MIN_DISCOUNT * 100}%`);
  console.log(`💰 Max Price: $${MAX_PRICE}`);
  console.log('='.repeat(50));
  
  // Initial scan
  const opportunities = await scanForOpportunities();
  console.log(`\n📊 Found ${opportunities.length} opportunities\n`);
  
  if (opportunities.length > 0) {
    console.log('Top 5 Opportunities:');
    for (const opp of opportunities.slice(0, 5)) {
      console.log(`  • ${opp.cardName}`);
      console.log(`    $${opp.listingPrice} (${opp.discount.toFixed(1)}% below fair value)`);
    }
    
    await saveOpportunities(opportunities);
  }
  
  // Continue monitoring
  console.log(`\n⏰ Next scan in ${SCAN_INTERVAL / 1000}s...`);
  setInterval(async () => {
    const opps = await scanForOpportunities();
    if (opps.length > 0) {
      await saveOpportunities(opps);
    }
  }, SCAN_INTERVAL);
}

main().catch(console.error);
