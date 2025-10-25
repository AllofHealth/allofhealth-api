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

// Booking Response from Calendar Provider
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

// Availability Query Parameters
export interface AvailabilityParams {
  eventTypeId: number;
  startDate: Date;
  endDate: Date;
  timeZone?: string;
  lengthInMinutes: number;
}

// Availability Response
export interface AvailabilityResponse {
  slots: TimeSlot[];
}

// Time Slot
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Video Provider Interface
export interface IVideoProvider {
  //  Create a video room
  createRoom(params: CreateRoomParams): Promise<VideoRoomResponse>;

  // Get room details
  getRoom(roomId: string): Promise<VideoRoomResponse>;

  //  Delete/disable a room
  deleteRoom(roomId: string): Promise<void>;
}

//  Room Creation Parameters
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

//  Video Room Response
export interface VideoRoomResponse {
  id: string;
  name: string;
  url: string;
  meetingToken?: string;
  config?: Record<string, any>;
  expiresAt?: Date;
}
