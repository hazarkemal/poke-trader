import { NextResponse } from 'next/server';
import { ethers } from 'ethers';

const WALLET = '0x55bbaE00Eebad7e3bBab0Da5C98C8F4011cEfe64';
const POLYGON_RPC = 'https://polygon-rpc.com';
const USDC_ADDRESS = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

async function getWalletBalances() {
  try {
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC);
    
    // Get MATIC balance
    const maticBalance = await provider.getBalance(WALLET);
    const matic = parseFloat(ethers.formatEther(maticBalance));
    
    // Get USDC balance
    const usdcContract = new ethers.Contract(
      USDC_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    const usdcBalance = await usdcContract.balanceOf(WALLET);
    const usdc = parseFloat(ethers.formatUnits(usdcBalance, 6));
    
    return { matic, usdc };
  } catch (error) {
    console.error('Error fetching balances:', error);
    return { matic: 0, usdc: 0 };
  }
}

export async function GET() {
  const balances = await getWalletBalances();
  
  // Real stats - will be populated from database when trading starts
  const stats = {
    balance_usdc: balances.usdc,
    balance_matic: balances.matic,
    total_trades: 0,
    winning_trades: 0,
    total_profit: 0,
    portfolio_value: balances.usdc, // Portfolio = cash + holdings value
    win_rate: 0,
    status: balances.usdc > 10 ? 'TRADING' : 'AWAITING_FUNDS'
  };
  
  return NextResponse.json(stats);
}

export const revalidate = 30; // Revalidate every 30 seconds
