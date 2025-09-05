export type TEmailContext = 'WELCOME' | 'OTP' | 'APPROVAL';

export interface ISendEmail {
  name?: string;
  to: string;
  subject: string;
  body: string;
  from?: string;
  useHtml?: boolean;
  context?: TEmailContext;
}

export interface IHandleOnboarding {
  from?: string;
  to?: string;
  subject?: string;
  name: string;
  nextStepUrl?: string;
}

export interface IHandleOtp {
  name: string;
  to: string;
  from?: string;
  subject?: string;
  verifyUrl?: string;
  code: string;
}
