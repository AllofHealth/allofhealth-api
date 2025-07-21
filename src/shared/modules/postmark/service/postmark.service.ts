import { Injectable } from '@nestjs/common';
import { PostmarkProvider } from '../provider/postmark.provider';
import { ISendEmail } from '../interface/postmark.interface';

@Injectable()
export class PostmarkService {
  constructor(private readonly postmarkProvider: PostmarkProvider) {}

  async sendEmail(ctx: ISendEmail) {
    return await this.postmarkProvider.sendEmail(ctx);
  }
}
