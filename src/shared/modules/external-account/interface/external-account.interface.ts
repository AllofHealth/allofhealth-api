import type { ethers } from 'ethers';
import type { Result } from 'neverthrow';
import type {
  CreateSignerError,
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';

type WalletData = {
  publicKey: string;
  privateKey: string;
  walletAddress: string;
};

type SignerResult = {
  signer: ethers.Signer;
  walletData: WalletData;
};

export type TWalletResult = Result<WalletData, WalletCreationError>;
export type TProviderResult = Result<ethers.JsonRpcProvider, ProviderError>;
export type TCreateSignerResult = Result<SignerResult, CreateSignerError>;
