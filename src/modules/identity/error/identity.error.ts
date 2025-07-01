import { HttpStatus } from '@nestjs/common';
import { IDENTITY_ERROR_MESSAGES } from '../data/identity.data';

export class IdentityError extends Error {
  public status: number;
  constructor(
    message: string = IDENTITY_ERROR_MESSAGES.ERROR_STORING_IDENTIFICATION,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'IdentityError';
    this.status = status;
  }
}
