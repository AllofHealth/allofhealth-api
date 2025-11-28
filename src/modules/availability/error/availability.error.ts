export class AvailabilityError extends Error {
  constructor(message: string, opts?: ErrorOptions) {
    super(message, opts);
    this.name = 'AvailabilityError';
  }
}
