export class TelemedicineError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TelemedicineError';
  }
}
