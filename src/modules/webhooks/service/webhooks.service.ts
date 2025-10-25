import { CalConfig } from '@/shared/config/cal.com/cal.config';
import { DoxyConfig } from '@/shared/config/doxy/doxy.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhooksService {
  constructor(
    private readonly calConfig: CalConfig,
    private readonly doxyConfig: DoxyConfig,
  ) {}

  private extractPatientIdFromUrl(doxyUrl: string): string | null {
    try {
      const url = new URL(doxyUrl);
      return url.searchParams.get('pid');
    } catch (error) {
      return null;
    }
  }

  private verifyCalWebhookSignature(
    payload: string,
    signature: string,
  ): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac(
      'sha256',
      this.calConfig.CALCOM_WEBHOOK_SECRET,
    );
    const digest = hmac.update(payload).digest('hex');

    return digest === signature;
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

  async procesCalEvents(req: Request) {}

  async processDoxyEvents(req: Request) {}

  async processFlutterEvents(req: Request) {}
}
