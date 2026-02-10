import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';

const WALLET_PATH = path.join(process.cwd(), '.wallet.json');

export interface WalletInfo {
  address: string;
  privateKey: string;
  createdAt: string;
}

export function createWallet(): WalletInfo {
  const wallet = ethers.Wallet.createRandom();
  const info: WalletInfo = {
    address: wallet.address,
    privateKey: wallet.privateKey,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(WALLET_PATH, JSON.stringify(info, null, 2), { mode: 0o600 });
  console.log('🔐 New wallet created:', info.address);
  
  return info;
}

export function loadWallet(): WalletInfo | null {
  if (!fs.existsSync(WALLET_PATH)) return null;
  return JSON.parse(fs.readFileSync(WALLET_PATH, 'utf-8'));
}

export function getOrCreateWallet(): WalletInfo {
  const existing = loadWallet();
  if (existing) return existing;
  return createWallet();
}

export const POLYGON_RPC = 'https://polygon-rpc.com';

export function getProvider() {
  return new ethers.JsonRpcProvider(POLYGON_RPC);
}

export function getSigner(privateKey: string) {
  return new ethers.Wallet(privateKey, getProvider());
}
