export class BookingError extends Error {
  constructor(message: string, opts?: ErrorOptions) {
    super(message, opts);
    this.name = 'BookingError';
  }
}
