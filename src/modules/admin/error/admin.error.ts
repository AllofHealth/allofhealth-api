export class AdminError extends Error {
  readonly status: number;
  constructor(message: string, options: ErrorOptions, status: number) {
    super(message, options);
    this.name = 'AdminError';
    this.status = status;
  }
}
