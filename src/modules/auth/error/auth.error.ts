import { HttpStatus } from '@nestjs/common';
import { AuthErrorMessage } from '../data/auth.data';

export class AuthError extends Error {
  public status: number;
  constructor(
    message: string = AuthErrorMessage.REGISTRATION_FAILED,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.status = status;
  }
}
