import { config } from 'dotenv';
config();

//Auth
export const SALT_ROUNDS = 12;

export const EXPIRES_IN = '7d';
export const PORT = 3000;

// Lisk mainnet
export const LISK_MAINNET_RPC_URL = 'https://rpc.api.lisk.com';
export const LISK_MAINNET_CHAINID = 1135;

// Lisk testnet
export const LISK_TESTNET_RPC_URL = 'https://rpc.sepolia-api.lisk.com';
export const LISK_TESTNET_CHAINID = 4202;

//Bundler
export const LISK_TESTNET_BUNDLER_ID = process.env.LISK_TESTNET_BUNDLER_ID;
export const LISK_TESTNET_BUNDLER_URL = process.env.LISK_TESTNET_BUNDLER_URL;
export const LISK_TESTNET_BUNDLER_API_KEY =
  process.env.LISK_TESTNET_BUNDLER_API_KEY;
export const LISK_TESTNET_PAYMASTER_API_KEY =
  process.env.LISK_TESTNET_PAYMASTER_API_KEY;

export const LISK_MAINNET_BUNDLER_ID = process.env.LISK_MAINNET_BUNDLER_ID;
export const LISK_MAINNET_BUNDLER_URL = process.env.LISK_MAINNET_BUNDLER_URL;
export const LISK_MAINNET_BUNDLER_API_KEY =
  process.env.LISK_MAINNET_BUNDLER_API_KEY;
export const LISK_MAINNET_PAYMASTER_API_KEY =
  process.env.LISK_MAINNET_PAYMASTER_API_KEY;

export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
export const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
export const SUPER_PRIVATE_KEY = process.env.SUPER_PRIVATE_KEY;

// Profile
export const PLACEHOLDER =
  'https://www.kravemarketingllc.com/wp-content/uploads/2018/09/placeholder-user-500x500.png';
