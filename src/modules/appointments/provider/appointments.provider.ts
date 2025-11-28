import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppointmentsProvider {
  constructor(private readonly handler: ErrorHandler) {}
}
