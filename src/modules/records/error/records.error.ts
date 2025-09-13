import { HttpStatus } from '@nestjs/common';

export class RecordsError extends Error {
  readonly status: number;
  constructor(message: string, options?: ErrorOptions, status?: number) {
    super(message, options);
    this.name = 'RecordsError';
    this.status = status || HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
