import { HttpStatus } from '@nestjs/common';

export class AssetError extends Error {
  public status: number;
  constructor(
    message: string,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR
  ) {
    super(message);
    this.status = status;
    this.name = 'AssetError';
  }
}
