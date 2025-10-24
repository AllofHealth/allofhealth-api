import { DoxyConfig } from '@/shared/config/doxy/doxy.config';
import { Injectable } from '@nestjs/common';
import { IConstructDoxyUrl } from '../interface/doxy.interface';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';

@Injectable()
export class DoxyProvider {
  private readonly logger = new MyLoggerService(DoxyProvider.name);
  constructor(private readonly doxyConfig: DoxyConfig) {}

  constructDoxyUrl(ctx: IConstructDoxyUrl): string {
    const baseUrl = this.doxyConfig.DOXY_CLINIC_SUBDOMAIN
      ? `https://${this.doxyConfig.DOXY_CLINIC_SUBDOMAIN}.${this.doxyConfig.DOXY_BASE_URL.replace('https://', '')}`
      : this.doxyConfig.DOXY_BASE_URL;

    const queryParams = new URLSearchParams({
      pid: ctx.patientId,
      booking: ctx.bookingId.toString(),
    });

    return `${baseUrl}/${ctx.providerRoom}?${queryParams.toString()}`;
  }

  extractPatientIdFromUrl(doxyUrl: string) {
    try {
      const url = new URL(doxyUrl);
      return url.searchParams.get('pid');
    } catch (error) {
      this.logger.error('Failed to parse Doxy.me URL', error);
      return null;
    }
  }
}
