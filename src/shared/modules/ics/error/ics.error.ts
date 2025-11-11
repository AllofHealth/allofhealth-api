export class IcsError extends Error {
  constructor(message: string, opts: ErrorOptions) {
    super(message, opts);
    this.name = 'Ics Error';
  }
}
