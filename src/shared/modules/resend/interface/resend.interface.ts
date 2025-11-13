export type TEmailContext = 'WELCOME' | 'OTP' | 'APPROVAL';
export type TBookingEmailContext =
  | 'BOOKING_CREATED'
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
  date?: string;
  startTime?: string;
  endTime?: string;
  consultationType?: string;
  videoRoomUrl?: string;
  bookingReference: string;
  calendarUrl?: string;
}

export interface IHandleSendDoctorNotificationEmail
  extends IHandlePatientConfirmationEmail {}

export interface IHandleSendReminderEmail {
  doctorName: string;
  patientName: string;
  from?: string;
  to: string;
  subject?: string;
  consultationType: string;
  paymentUrl: string;
  date: string;
  time: string;
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
  startTime?: string;
  endTime?: string;
  videoRoomUrl?: string;
  bookingReference: string;
  refundAmount?: number;
  context?: TBookingEmailContext;
  consultationType?: string;
  paymentUrl?: string;
  time?: string;
  date?: string;
  calendarUrl?: string;
}

export interface IHandleBookingRequest {
  from?: string;
  subject?: string;
  to: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  consultationType: string;
  paymentUrl?: string;
}
