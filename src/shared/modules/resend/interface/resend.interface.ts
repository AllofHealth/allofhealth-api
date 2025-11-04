export type TEmailContext = 'WELCOME' | 'OTP' | 'APPROVAL';
export type TBookingEmailContext =
  | 'PATIENT_CONFIRMATION'
  | 'DOCTOR_NOTIFICATION'
  | 'REMINDER'
  | 'CANCELATION';

export interface ISendEmail {
  name?: string;
  to: string;
  subject?: string;
  body?: string;
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

export interface IHandleBooking {
  from?: string;
  to?: string;
  subject?: string;
  patientName?: string;
  doctorName?: string;
  startTime?: Date;
  endTime?: Date;
  videoRoomUrl?: string;
  bookingReference: string;
  refundAmount?: number;
  context?: TBookingEmailContext;
  reminderType?: string;
}
