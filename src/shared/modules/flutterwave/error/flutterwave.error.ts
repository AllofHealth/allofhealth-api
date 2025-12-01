export class FlutterwaveError extends Error {
  constructor(message: string, opts: ErrorOptions) {
    super(message, opts);
    this.name = 'FlutterwaveError';
  }
}
