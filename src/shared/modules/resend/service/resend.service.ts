import { Injectable } from '@nestjs/common';
import { ResendProvider } from '../provider/resend.provider';
import { ISendEmail } from '../interface/resend.interface';

@Injectable()
export class ResendService {
  constructor(private readonly resendProvider: ResendProvider) {}

  async sendEmail(ctx: ISendEmail) {
    return await this.resendProvider.sendEmail(ctx);
  }
}
