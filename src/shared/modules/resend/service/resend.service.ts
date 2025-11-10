import { Injectable } from '@nestjs/common';
import { ResendProvider } from '../provider/resend.provider';
import { OnEvent } from '@nestjs/event-emitter';
import { SharedEvents } from '@/shared/events/shared.events';
import { ESendEmail } from '@/shared/dtos/event.dto';
import { IHandleBooking } from '../interface/resend.interface';

@Injectable()
export class ResendService {
  constructor(private readonly resendProvider: ResendProvider) {}

  @OnEvent(SharedEvents.SEND_ONBOARDING)
  async sendEmail(ctx: ESendEmail) {
    return await this.resendProvider.sendEmail(ctx);
  }

  async sendBookingEmail(ctx: IHandleBooking) {}
}
