export class ApprovalError extends Error {
  constructor(message: string, options: ErrorOptions) {
    super(message, options);
    this.name = 'ApprovalError';
  }
}
