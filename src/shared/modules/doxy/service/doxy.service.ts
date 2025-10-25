import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { DoxyProvider } from '../provider/doxy.provider';
import {
  ICreateDoctorRoom,
  ICreateRoom,
  VideoRoomResponse,
} from '../interface/doxy.interface';
import { DoxyConfig } from '@/shared/config/doxy/doxy.config';
import { DoxyError } from '../error/doxy.error';

@Injectable()
export class DoxyService {
  constructor(
    private readonly doxyProvider: DoxyProvider,
    private readonly doxyConfig: DoxyConfig,
  ) {}

  private sanitizeName(name: string) {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }

  async createRoom(ctx: ICreateRoom): Promise<VideoRoomResponse> {
    try {
      const patientId = ctx.metadata?.patientId || 'guest';
      const doctorRoom =
        ctx.metadata?.doctorRoom || this.doxyConfig.DOXY_DEFAULT_PROVIDER_ROOM;
      const bookingId = ctx.metadata?.bookingId || Date.now();

      const roomUrl = this.doxyProvider.constructDoxyUrl({
        providerRoom: doctorRoom,
        patientId,
        bookingId,
      });

      return {
        id: `doxy-${bookingId}`,
        name: ctx.name,
        url: roomUrl,
        config: {
          provider: 'doxy',
          patientId,
          doctorRoom,
          bookingId,
        },
        expiresAt: ctx.properties?.expiresAt,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        new DoxyError(
          `An error occurred while creating room ${error.message}`,
          { cause: error },
        ),
        { cause: error },
      );
    }
  }

  async getRoom(roomId: string): Promise<VideoRoomResponse> {
    return {
      id: roomId,
      name: 'Doxy Consultation',
      url: '',
      config: {},
    };
  }

  async createDoctorRoom(ctx: ICreateDoctorRoom) {
    const { doctorId, doctorName, patientId, bookingId } = ctx;

    const doctorRoomName = this.sanitizeName(doctorName);
    return await this.createRoom({
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
}
