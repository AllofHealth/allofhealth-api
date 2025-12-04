import { config } from 'dotenv';

config();

//Auth
export const SALT_ROUNDS = 12;
export const DAILY_TARGET = 5;

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

//IPFS
export const IPFS_HOST = process.env.IPFS_HOST;
export const IPFS_PORT = process.env.IPFS_PORT;
export const IPFS_PROTOCOL = process.env.IPFS_PROTOCOL;
export const IPFS_API_KEY = process.env.IPFS_API_KEY;
export const IPFS_API_SECRET = process.env.IPFS_API_SECRET;

//RECORDS
export const RECORD_ENCRYPTION_KEY = process.env.RECORD_ENCRYPTION_KEY;

// EMAIL RESEND
export const RESEND_API_KEY = process.env.RESEND_API_KEY;

// Brevo
export const BREVO_API_KEY = process.env.BREVO_API_KEY;

export const APP_ENV = process.env.NODE_ENV || 'STAGING';

export const FLUTTERWAVE_CLIENT_ID = process.env.FLUTTERWAVE_CLIENT_ID;
export const FLUTTERWAVE_CLIENT_SECRET = process.env.FLUTTERWAVE_CLIENT_SECRET;
export const FLUTTERWAVE_ENCRYPTION_KEY =
  process.env.FLUTTERWAVE_ENCRYPTION_KEY;
export const FLUTTERWAVE_WEBHOOK_URL = process.env.FLUTTERWAVE_WEBHOOK_URL;
export const FLUTTERWAVE_WEBHOOK_SECRET =
  process.env.FLUTTERWAVE_WEBHOOK_SECRET;
export const FLUTTERWAVE_SANDBOX_BASE_URL =
  process.env.FLUTTERWAVE_SANDBOX_BASE_URL;
export const FLUTTERWAVE_PROD_BASE_URL = process.env.FLUTTERWAVE_PROD_BASE_URL;

export const IS_PRODUCTION =
  process.env.NODE_ENV === 'PRODUCTION' ? true : false;
export const PROD_URL = process.env.DATABASE_URL;
export const STAGING_URL = process.env.DATABASE_URL_STAGING;

export const CALCOM_API_KEY = process.env.CALCOM_API_KEY;
export const CALCOM_API_URL = process.env.CALCOM_API_URL;
export const CALCOM_WEBHOOK_SECRET = process.env.CALCOM_WEBHOOK_SECRET;
export const CALCOM_CLIENT_ID = process.env.CALCOM_CLIENT_ID;
export const CALCOM_CLIENT_SECRET = process.env.CALCOM_CLIENT_SECRET;
export const CALCOM_REDIRECT_URI = process.env.CALCOM_REDIRECT_URI;
export const CALCOM_EMBED_URL = process.env.CALCOM_EMBED_URL;
