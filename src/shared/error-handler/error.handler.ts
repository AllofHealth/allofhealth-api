import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import type { IHandleReturn } from '../interface/shared.interface';

@Injectable()
export class ErrorHandler {
  constructor(private readonly myLoggerService: MyLoggerService) {}

  handleError(error: any, context: string) {
    this.myLoggerService.error(`${context}: ${error.message}`);
    if (error.status) {
      throw new HttpException(context, error.status, { cause: error });
    }

    throw new InternalServerErrorException(error, context);
  }

  handleReturn<T, D = undefined, M = undefined>(args: IHandleReturn<T, D, M>) {
    this.myLoggerService.log(`Returning data: ${JSON.stringify(args)}`);
    return {
      status: args.status,
      message: args.message,
      data: args.data ? args.data : null,
      meta: args.meta ? args.meta : null,
    };
  }
}
