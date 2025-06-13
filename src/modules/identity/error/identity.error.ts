import { IDENTITY_ERROR_MESSAGES } from '../data/identity.data';

export class IdentityError extends Error {
  constructor(
    message: string = IDENTITY_ERROR_MESSAGES.ERROR_STORING_IDENTIFICATION,
  ) {
    super(message);
    this.name = 'IdentityError';
  }
}
