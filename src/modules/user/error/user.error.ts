import { HttpStatus } from '@nestjs/common';
import { USER_ERROR_MESSAGES } from '../data/user.data';

export class UserError extends Error {
  public status: number;

  constructor(
    message: string = USER_ERROR_MESSAGES.ERROR_CREATE_USER,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.name = 'UserError';
    this.status = status;
  }
}
