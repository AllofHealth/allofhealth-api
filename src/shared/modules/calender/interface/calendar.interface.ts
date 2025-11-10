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

export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export interface CreateRoomParams {
  name: string;
  privacy?: 'public' | 'private';
  properties?: {
    enableRecording?: boolean;
    maxParticipants?: number;
    expiresAt?: Date;
  };
  metadata?: Record<string, any>;
}

export interface VideoRoomResponse {
  id: string;
  name: string;
  url: string;
  meetingToken?: string;
  config?: Record<string, any>;
  expiresAt?: Date;
}

export interface IUpsertCalendarIntegration {
  doctorId: string;
  provider: string;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  providerUserId?: string;
  providerEmail?: string;
}

export interface ICreateBookingWithVideoRoom {
  params: CreateBookingParams;
  doctorInfo: { id: string; name: string };
  patientId: string;
}

export interface IGetAvailability {
  eventTypeId: number;
  startDate: Date;
  endDate: Date;
  lengthInMinutes: number;
}

export interface IFindIntegrationByDoctorId {
  doctorId: string;
  provider?: string;
}
