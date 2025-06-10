import { Result } from 'neverthrow';
import {
  CreateSignerError,
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';
import { ethers } from 'ethers';

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
