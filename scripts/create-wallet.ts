#!/usr/bin/env tsx
/**
 * Create a new wallet for the Pokemon Trading Agent
 */

import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

const WALLET_PATH = path.join(process.cwd(), '.wallet.json');

function main() {
  // Check if wallet already exists
  if (fs.existsSync(WALLET_PATH)) {
    const existing = JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
    console.log('⚠️  Wallet already exists!');
    console.log(`Address: ${existing.address}`);
    console.log(`Created: ${existing.createdAt}`);
    console.log('\nTo create a new wallet, delete .wallet.json first');
    return;
  }

  // Create new wallet
  const wallet = ethers.Wallet.createRandom();
  
  const walletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    mnemonic: wallet.mnemonic?.phrase,
    createdAt: new Date().toISOString(),
    network: 'polygon'
  };
  
  // Save wallet (with restricted permissions)
  fs.writeFileSync(WALLET_PATH, JSON.stringify(walletData, null, 2), { mode: 0o600 });
  
  console.log('🎉 New Pokemon Trader Wallet Created!');
  console.log('═'.repeat(50));
  console.log(`\n📍 Address: ${wallet.address}`);
  console.log(`\n🔐 Mnemonic (BACKUP THIS!):`);
  console.log(`   ${wallet.mnemonic?.phrase}`);
  console.log('\n⚠️  IMPORTANT:');
  console.log('   1. Save the mnemonic phrase securely');
  console.log('   2. Never share your private key');
  console.log('   3. Fund with MATIC for gas + USDC for trading');
  console.log('\n💳 To fund on Polygon:');
  console.log(`   Send MATIC and USDC to: ${wallet.address}`);
  console.log('\n═'.repeat(50));
}

main();
