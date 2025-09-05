export class ResendError extends Error {
  private status: number;
  constructor(message: string, options?: ErrorOptions, status?: number) {
    super(message, options);
    this.name = 'ResendError';
    this.status = status || 500;
  }
}
