import { Result } from 'neverthrow';
import {
  ProviderError,
  WalletCreationError,
} from '../errors/external-account.errors';
import { ethers } from 'ethers';

type WalletData = {
  publicKey: string;
  privateKey: string;
  walletAddress: string;
};

export type TWalletResult = Result<WalletData, WalletCreationError>;
export type TProviderResult = Result<ethers.JsonRpcProvider, ProviderError>;
