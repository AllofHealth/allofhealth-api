export class ApprovalError extends Error {
  private status: number;

  constructor(message: string, options: ErrorOptions, status?: number) {
    super(message, options);
    this.name = 'ApprovalError';
    this.status = status || 500;
  }
}
