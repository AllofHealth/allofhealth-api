import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable } from '@nestjs/common';
import { ResultAsync } from 'neverthrow';
import { USER_SUCCESS_MESSAGE } from '../data/user.data';
import { UserError } from '../error/user.error';
import { ICreateUser } from '../interface/user.interface';
import { UserProvider } from '../provider/user.provider';

@Injectable()
export class UserService {
  private handler: ErrorHandler;
  constructor(private readonly userProvider: UserProvider) {
    this.handler = new ErrorHandler();
  }

  createUser(ctx: ICreateUser) {
    const result = ResultAsync.fromPromise(
      this.userProvider.createUser(ctx),
      (error: Error) => new UserError(error.message),
    );
    return this.handler.handleResult(result, USER_SUCCESS_MESSAGE.USER_CREATED);
  }
}
