import { HttpStatus, Injectable } from '@nestjs/common';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import type { IHandleReturn } from '../interface/shared.interface';

@Injectable()
export class ErrorHandler {
  private readonly logger = new MyLoggerService(ErrorHandler.name);
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

  handleReturn<T, D = undefined, M = undefined>(args: IHandleReturn<T, D, M>) {
    return {
      status: args.status,
      message: args.message,
      data: args.data ? args.data : null,
      meta: args.meta ? args.meta : null,
    };
  }
}
