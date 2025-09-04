import { BrevoConfig } from '@/shared/config/brevo/brevo.config';
import { BadRequestException, Injectable } from '@nestjs/common';
import { IGetBrevoOptions } from '../interface/brevo.interface';

@Injectable()
export class BrevoProvider {
  constructor(private readonly brevoConfig: BrevoConfig) {}

  private getBrevoOptions(ctx: IGetBrevoOptions) {
    const { method, body } = ctx;
    if (method === 'POST' && !body) {
      throw new BadRequestException('Body is required for POST method');
    }
    switch (method) {
      case 'POST':
        return {
          method: method,
          headers: {
            accept: 'application/json',
            'content-Type': 'application/json',
            'api-key': this.brevoConfig.BREVO_API_KEY,
          },
          body: JSON.stringify({
            ...body,
            updateEnabled: false,
          }),
        };
      case 'GET':
        return {
          method: method,
          headers: {
            accept: 'application/json',
            'api-key': this.brevoConfig.BREVO_API_KEY,
          },
        };
    }
  }

  async createContact() {}
}
