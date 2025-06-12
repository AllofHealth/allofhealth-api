import { USER_ERROR_MESSAGES } from '../data/user.data';

export class UserError extends Error {
  constructor(message: string = USER_ERROR_MESSAGES.ERROR_CREATE_USER) {
    super(message);
    this.name = 'UserError';
  }
}
