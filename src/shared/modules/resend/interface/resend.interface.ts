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

export interface IHandlePatientConfirmationEmail {
  from?: string;
  to: string;
  subject?: string;
  patientName?: string;
  doctorName?: string;
  startTime?: Date;
  endTime?: Date;
  videoRoomUrl?: string;
  bookingReference: string;
}

export interface IHandleSendDoctorNotificationEmail
  extends IHandlePatientConfirmationEmail {}

export interface IHandleSendReminderEmail {
  from?: string;
  to: string;
  subject?: string;
  reminderType: string;
  startTime: Date;
  videoRoomUrl: string;
  bookingReference: string;
}

export interface IHandleSendCancellationEmail {
  from?: string;
  to: string;
  patientName: string;
  subject?: string;
  refundAmount?: number;
  bookingReference: string;
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
}
