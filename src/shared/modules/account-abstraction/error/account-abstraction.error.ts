import { AccountAbstractionErrorMessage } from '../data/account-abstraction.data';

export class CreateSmartAccountError extends Error {
  constructor(
    message: string = AccountAbstractionErrorMessage.ERROR_CREATING_SMART_ACCOUNT
  ) {
    super(message);
    this.name = 'CreateSmartAccountError';
  }
}

export class CreateSmartAccountClientError extends Error {
  constructor(
    message: string = AccountAbstractionErrorMessage.ERROR_CREATING_SMART_ACCOUNT_CLIENT
  ) {
    super(message);
    this.name = 'CreateSmartAccountClientError';
  }
}
