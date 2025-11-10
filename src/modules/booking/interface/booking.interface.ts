export type TPaymentStatus = 'successful' | 'failed' | 'pending';

export interface ICreateBooking {
  bookingReference: string;
  patientId: string;
  doctorId: string;
  consultationTypeId: string;
  consultationDate: Date;
  startTime: Date;
  endTime: Date;
  timezone: string;
  amount: number;
  currency: string;
  externalBookingId?: string;
  externalBookingUrl?: string;
  metadata?: Record<string, any>;
}

export interface IUpdateBookingStatus {
  bookingId: string;
  status: string;
  paymentStatus?: string;
}

export interface IUpdateVideoRoom {
  bookingId: string;
  videoRoomId: string;
  videoRoomUrl: string;
}

export interface IUpdatePaymentDetails {
  bookingId: string;
  paymentIntentId: string;
  paidAt?: Date;
}

export interface IGetPatientBookings {
  patientId: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IGetDoctorBookings {
  doctorId: string;
  status?: string;
  page?: number;
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}

interface IAttendee {
  name: string;
  email: string;
  timeZone: string;
}

export interface IHandleCalComBookingCreated {
  uid: string;
  title: string;
  startTime: string;
  endTime: string;
  attendees: Array<IAttendee>;
  metadata: Record<string, any>;
  eventTypeId: number;
}

export type TOpts = 'ref' | 'ext_id' | 'id';
export interface IFindBooking {
  opts: TOpts;
  refId?: string;
  extId?: string;
  id?: string;
}

export interface IInititalizeBookingPayment {
  calcomBookingId: string;
  patientId: string;
}

export interface IConfirmBooking {
  bookingId: string;
  paymentIntentId: string;
}

export interface ICancelBooking {
  uid?: string;
  bookingId?: string;
  cancelledBy: string;
  reason: string;
}

export interface IProcessBookingRefund {
  bookingId: string;
  reason?: string;
}

export interface ICreateVideoRoomForBooking {
  bookingId: string;
  doctorId: string;
  doctorName: string;
  patientId: string;
}

export interface IHandlePaymentSuccess {
  txRef: string;
  id: number;
  amount: number;
  status: TPaymentStatus;
  meta?: Record<string, any>;
}
