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

export interface ICancelBooking {
  bookingId: string;
  cancelledBy: string;
  reason: string;
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
