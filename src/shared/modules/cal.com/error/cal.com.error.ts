export class CalComError extends Error {
  constructor(message: string, opts: ErrorOptions) {
    super(message, opts);
    this.name = 'CalComError';
  }
}
