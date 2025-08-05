export type TEmailContext = 'WELCOME' | 'OTP' | 'APPROVAL';

export interface ISendEmail {
  to: string;
  subject: string;
  body: string;
  from?: string;
  useHtml?: boolean;
  context?: TEmailContext;
}
