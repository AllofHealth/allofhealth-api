import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IVideoProvider,
  CreateRoomParams,
  VideoRoomResponse,
} from '../interface/calendar-provider.interface';

@Injectable()
export class DoxyService implements IVideoProvider {
  private readonly logger = new Logger(DoxyService.name);
  private readonly baseUrl: string;
  private readonly clinicSubdomain: string;
  private readonly defaultProviderRoom: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('doxy.baseUrl') || '';
    this.clinicSubdomain =
      this.configService.get<string>('doxy.clinicSubdomain') || '';
    this.defaultProviderRoom =
      this.configService.get<string>('doxy.defaultProviderRoom') || '';

    if (!this.clinicSubdomain) {
      this.logger.warn('Doxy.me clinic subdomain not configured');
    }
  }

  /**
   * Create a Doxy.me room link
   * Since Doxy doesn't have a full API for dynamic rooms yet,
   * we'll generate URLs based on their format: https://{subdomain}.doxy.me/{room}?pid={patientId}
   */
  async createRoom(params: CreateRoomParams): Promise<VideoRoomResponse> {
    try {
      this.logger.log(`Creating Doxy.me room for: ${params.name}`);

      // Generate unique room identifier from metadata
      const patientId = params.metadata?.patientId || 'guest';
      const doctorRoom =
        params.metadata?.doctorRoom || this.defaultProviderRoom;
      const bookingId = params.metadata?.bookingId || Date.now();

      // Construct Doxy.me URL with patient identifier
      const roomUrl = this.constructDoxyUrl(doctorRoom, patientId, bookingId);

      this.logger.log(`Doxy.me room URL generated: ${roomUrl}`);

      return {
        id: `doxy-${bookingId}`,
        name: params.name,
        url: roomUrl,
        config: {
          provider: 'doxy',
          patientId,
          doctorRoom,
          bookingId,
        },
        expiresAt: params.properties?.expiresAt,
      };
    } catch (error) {
      this.logger.error('Failed to create Doxy.me room', error);
      throw error;
    }
  }

  /**
   * Get room details
   * Note: Doxy doesn't provide API to fetch room details yet
   */
  async getRoom(roomId: string): Promise<VideoRoomResponse> {
    this.logger.warn(
      'Doxy.me getRoom called - limited functionality without API',
    );

    // Return basic info from roomId
    return {
      id: roomId,
      name: 'Doxy Consultation',
      url: '', // Would need to reconstruct from stored data
      config: {},
    };
  }

  /**
   * Delete/disable a room
   * Note:  I just discovered that Doxy rooms are persistent and managed by provider
   */
  async deleteRoom(roomId: string): Promise<void> {
    this.logger.log(`Doxy.me room cleanup for ${roomId} - no action needed`);
    // So, Doxy rooms are permanent until provider manually deletes them
    // No API action required
  }

  /**
   * Construct Doxy.me URL with proper format
   * Format: https://{subdomain}.doxy.me/{providerRoom}?pid={patientId}&booking={bookingId}
   */
  private constructDoxyUrl(
    providerRoom: string,
    patientId: string,
    bookingId: string | number,
  ): string {
    const baseUrl = this.clinicSubdomain
      ? `https://${this.clinicSubdomain}.${this.baseUrl.replace('https://', '')}`
      : this.baseUrl;

    const queryParams = new URLSearchParams({
      pid: patientId,
      booking: bookingId.toString(),
    });

    return `${baseUrl}/${providerRoom}?${queryParams.toString()}`;
  }

  // Generate a Doxy.me room for a specific doctor
  async createDoctorRoom(
    doctorId: string,
    doctorName: string,
    patientId: string,
    bookingId: string,
  ): Promise<VideoRoomResponse> {
    // Sanitize doctor name for URL (replace spaces with hyphens, lowercase)
    const doctorRoomName = doctorName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');

    return this.createRoom({
      name: `${doctorName} Consultation`,
      privacy: 'private',
      metadata: {
        doctorId,
        doctorRoom: doctorRoomName,
        patientId,
        bookingId,
      },
      properties: {
        maxParticipants: 2,
      },
    });
  }

  /**
   * Parse patient ID from Doxy.me URL
   * Going to be Useful when processing webhooks
   */
  extractPatientIdFromUrl(doxyUrl: string): string | null {
    try {
      const url = new URL(doxyUrl);
      return url.searchParams.get('pid');
    } catch (error) {
      this.logger.error('Failed to parse Doxy.me URL', error);
      return null;
    }
  }
}
