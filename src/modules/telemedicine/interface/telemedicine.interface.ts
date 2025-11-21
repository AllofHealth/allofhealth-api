export interface ISendConfirmationEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
  videoRoomUrl: string;
  startTime: Date;
  endTime: Date;
  type: string;
}

export interface ISendCancelationEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
  refundAmount?: number;
  type: string;
}

export interface ISendSurveyEmail {
  bookingId: string;
  patientId: string;
  doctorId: string;
}

export interface ISendRequestReview extends ISendSurveyEmail {}

export interface ISendTelemedicineReminder {
  bookingId: string;
  patientId: string;
  doctorId: string;
  reminderType: string;
  videoRoomUrl: string;
  delay: number;
}

export interface ILogAuditTrail {
  bookingId: string;
  action: string;
  actorId: string;
  actorType: string;
  previousStatus?: string;
  newStatus?: string;
  changes?: Record<string, any>;
}

export interface IHandleBookingCreationJob {
  bookingId: string;
  patientId: string;
  type: string;
}

export interface IGetDoctorAvailability {
  doctorId: string;
  consultationTypeId: string;
  startDate: Date;
  endDate: Date;
}

export interface ICheckSlotAvailability {
  doctorId: string;
  consultationTypeId: string;
  startTime: Date;
}

export interface IGetCalComEmbedConfig {
  consultationTypeId: string;
  doctorId?: string;
}

export interface IPendingBookingData {
  id: string;
  externalBookingId: string | null;
  patientId: string;
  patientEmail: string | null;
  patientFullName: string | null;
  doctorFullName: string | null;
  consultationType: string | null;
  startTime: Date;
  endTime: Date;
}

export interface IReminderEmailPayload {
  patientName: string;
  doctorName: string;
  to: string;
  paymentUrl: string;
  consultationType: string;
  date: string;
  time: string;
}
