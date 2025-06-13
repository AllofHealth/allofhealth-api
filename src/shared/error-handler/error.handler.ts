import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { HttpStatus } from '@nestjs/common';
import { Result, ResultAsync } from 'neverthrow';
import { IHandleReturn } from '../interface/shared.interface';

export class ErrorHandler {
  private readonly logger = new MyLoggerService(ErrorHandler.name);

  handleResult<T, E extends Error>(
    result: Result<T, E> | ResultAsync<T, E>,
    successMessage: string,
  ) {
    return result.match(
      (data) =>
        this.handleReturn({
          status: HttpStatus.OK,
          message: successMessage,
          data,
        }),
      (error) => this.handleError(error, error.message),
    );
  }

  handleError(error: any, context: string) {
    console.error(error, context);
    this.logger.error(`${context}: ${error.message}`);
    if (error.status) {
      return {
        //eslint-disable-next-line
        status: error.status,
        //eslint-disable-next-line
        message: error.message || context,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: context,
      //eslint-disable-next-line
      error: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    };
  }

  private handleReturn<T, D = undefined, M = undefined>(
    args: IHandleReturn<T, D, M>,
  ) {
    return {
      status: args.status,
      message: args.message,
      data: args.data ? args.data : null,
      meta: args.meta ? args.meta : null,
    };
  }
}
