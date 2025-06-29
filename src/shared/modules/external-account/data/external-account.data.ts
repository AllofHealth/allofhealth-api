export enum ExternalAccountSuccessMessage {
  WALLET_CREATED = 'Wallet created successfully',
  PROVIDER_CONNECTED = 'Provider connected successfully',
  SIGNER_CREATED = 'Signer created successfully',
}

export enum ExternalAccountErrorMessage {
  FAILED_TO_CREATE_WALLET = 'Failed to create wallet',
  INVALID_RPC_URL = 'Invalid RPC URL',
  PROVIDER_CONNECTION_FAILED = 'Failed to connect to provider',
  ERROR_CREATING_SIGNER = 'Error creating signer',
  ERROR_PROVIDING_SIGNER = 'Error providing signer',
}
