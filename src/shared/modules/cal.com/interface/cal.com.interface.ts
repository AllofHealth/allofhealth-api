export type TCalMethods = 'GET' | 'POST';

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface BookingResponse {
  id: string | number;
  uid?: string;
  title?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  meetingUrl?: string;
  attendees: Array<{
    name: string;
    email: string;
    timeZone: string;
  }>;
  metadata?: Record<string, any>;
}

export interface CreateBookingParams {
  eventTypeId: number;
  attendee: {
    name: string;
    email: string;
    timeZone: string;
    phoneNumber?: string;
  };
  startTime: Date;
  endTime?: Date;
  meetingUrl?: string;
  metadata?: Record<string, any>;
  lengthInMinutes?: number;
}

export interface AvailabilityParams {
  eventTypeId: number;
  startDate: Date;
  endDate: Date;
  timeZone?: string;
  lengthInMinutes: number;
}

export interface AvailabilityResponse {
  slots: TimeSlot[];
}

export interface ICancelBooking {
  bookingId: string;
  reason?: string;
}

export interface IRescheduleBooking {
  bookingId: string;
  newStartTime: Date;
}

export interface IHandleCalRequests {
  method: TCalMethods;
  url: string;
  data?: string;
  src: string;
}
