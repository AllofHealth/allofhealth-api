import { ExternalAccountErrorMessage } from '../data/external-account.data';

export class WalletCreationError extends Error {
  constructor(
    message: string = ExternalAccountErrorMessage.FAILED_TO_CREATE_WALLET,
  ) {
    super(message);
    this.name = 'WalletCreationError';
  }
}

export class ProviderError extends Error {
  constructor(
    message: string = ExternalAccountErrorMessage.PROVIDER_CONNECTION_FAILED,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

export class CreateSignerError extends Error {
  constructor(
    message: string = ExternalAccountErrorMessage.ERROR_CREATING_SIGNER,
  ) {
    super(message);
    this.name = 'CreateSignerError';
  }
}
