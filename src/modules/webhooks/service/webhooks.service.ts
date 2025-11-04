import { BookingService } from '@/modules/booking/service/booking.service';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { CalConfig } from '@/shared/config/cal.com/cal.config';
import { DoxyConfig } from '@/shared/config/doxy/doxy.config';
import { FlutterwaveConfig } from '@/shared/config/flutterwave/flutterwave.config';
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhooksService {
  private readonly logger = new MyLoggerService(WebhooksService.name);
  constructor(
    private readonly calConfig: CalConfig,
    private readonly doxyConfig: DoxyConfig,
    private readonly flutterConfig: FlutterwaveConfig,
    private readonly bookingService: BookingService,
  ) {}

  private extractPatientIdFromUrl(doxyUrl: string): string | null {
    try {
      const url = new URL(doxyUrl);
      return url.searchParams.get('pid');
    } catch (error) {
      return null;
    }
  }

  verifyCalWebhookSignature(req: any) {
    const hash = crypto
      .createHmac('sha256', this.calConfig.CALCOM_WEBHOOK_SECRET)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-cal-signature-256']) {
      this.logger.error('Invalid Cal.com webhook signature');
      return;
    }
  }

  private verifyDoxyWebhookSignature(
    payload: string,
    signature: string,
  ): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac(
      'sha256',
      this.doxyConfig.DOXY_WEBHOOK_SECRET,
    );
    const digest = hmac.update(payload).digest('hex');

    return digest === signature;
  }

  private verifyWebhookSignature(payload: string, signature: string): boolean {
    return signature === this.flutterConfig.FLUTTERWAVE_WEBHOOK_SECRET;
  }

  async procesCalEvents(req: any) {
    this.verifyCalWebhookSignature(req);
    const payload = req.body;

    switch (payload.triggerEvent) {
      case 'BOOKING_CREATED':
        return await this.bookingService.handleCalComBookingCreated({
          attendees: payload.attendees,
          endTime: payload.endTime,
          startTime: payload.startTime,
          eventTypeId: payload.eventTypeId,
          title: payload.title,
          uid: payload.uid,
          metadata: payload.metadata,
        });

      case 'BOOKING_CANCELLED':
        return await this.bookingService.cancelBooking({
          uid: payload.uid,
          cancelledBy: 'Cancelled by widget',
          reason: 'Booking no longer needed',
        });
    }
  }

  async processDoxyEvents(req: Request) {}

  async processFlutterEvents(req: Request) {}
}
