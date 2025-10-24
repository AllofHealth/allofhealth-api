export type TPrivacy = 'public' | 'private';

export interface IConstructDoxyUrl {
  providerRoom: string;
  patientId: string;
  bookingId: string | number;
}

export interface VideoRoomResponse {
  id: string;
  name: string;
  url: string;
  meetingToken?: string;
  config?: Record<string, any>;
  expiresAt?: Date;
}

export interface ICreateRoom {
  name: string;
  privacy?: TPrivacy;
  properties?: {
    enableRecording?: boolean;
    maxParticipants?: number;
    expiresAt?: Date;
  };
  metadata?: Record<string, any>;
}
