import axios from 'axios';

const COURTYARD_API = 'https://api.courtyard.io/api/v1';
const COURTYARD_WEB = 'https://courtyard.io';

export interface Card {
  id: string;
  name: string;
  set: string;
  rarity: string;
  grade?: string;
  price: number;
  image: string;
  listingId?: string;
  seller?: string;
}

export interface PriceData {
  cardId: string;
  floorPrice: number;
  avgPrice: number;
  lastSale: number;
  volume24h: number;
  listings: number;
}

// Scrape Courtyard listings for Pokemon cards
export async function getListings(category = 'pokemon', limit = 100): Promise<Card[]> {
  try {
    // Note: Courtyard may require auth or have different API structure
    // This is a placeholder - we'll need to reverse engineer their API
    const response = await axios.get(`${COURTYARD_WEB}/api/marketplace/listings`, {
      params: {
        category,
        limit,
        sort: 'price_asc'
      },
      headers: {
        'User-Agent': 'PokeTrader/1.0'
      }
    });
    
    return response.data.listings || [];
  } catch (error) {
    console.error('Error fetching listings:', error);
    return [];
  }
}

// Get price history for a card
export async function getPriceHistory(cardId: string): Promise<PriceData | null> {
  try {
    const response = await axios.get(`${COURTYARD_WEB}/api/cards/${cardId}/price-history`);
    return response.data;
  } catch (error) {
    console.error('Error fetching price history:', error);
    return null;
  }
}

// Calculate fair value based on recent sales
export function calculateFairValue(prices: number[]): number {
  if (prices.length === 0) return 0;
  
  // Remove outliers (top and bottom 10%)
  const sorted = [...prices].sort((a, b) => a - b);
  const trimStart = Math.floor(sorted.length * 0.1);
  const trimEnd = Math.ceil(sorted.length * 0.9);
  const trimmed = sorted.slice(trimStart, trimEnd);
  
  // Return average
  return trimmed.reduce((sum, p) => sum + p, 0) / trimmed.length;
}

// Find arbitrage opportunities
export function findOpportunities(listings: Card[], priceData: Map<string, PriceData>): Card[] {
  const opportunities: Card[] = [];
  
  for (const listing of listings) {
    const data = priceData.get(listing.id);
    if (!data) continue;
    
    const fairValue = data.avgPrice;
    const discount = (fairValue - listing.price) / fairValue;
    
    // Look for 15%+ discount
    if (discount >= 0.15) {
      opportunities.push({
        ...listing,
        // @ts-ignore
        discount: (discount * 100).toFixed(1),
        fairValue
      });
    }
  }
  
  // Sort by best discount
  return opportunities.sort((a, b) => {
    // @ts-ignore
    return parseFloat(b.discount) - parseFloat(a.discount);
  });
}

// Monitor specific card sets
export const WATCHED_SETS = [
  'base-set',
  'jungle',
  'fossil',
  'team-rocket',
  'gym-heroes',
  'gym-challenge',
  'neo-genesis',
  'neo-discovery',
  'neo-revelation',
  'neo-destiny',
  'expedition',
  'aquapolis',
  'skyridge',
  'ex-ruby-sapphire',
  'celebrations',
  'evolving-skies',
  '151'
];

// High value cards to watch
export const WATCHED_CARDS = [
  'charizard',
  'pikachu',
  'blastoise',
  'venusaur',
  'mewtwo',
  'mew',
  'lugia',
  'ho-oh',
  'rayquaza',
  'umbreon'
];
