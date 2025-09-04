import { Injectable } from '@nestjs/common';
import { NewsletterProvider } from '../provider/newsletter.provider';
import {
  ICreateContact,
  IFetchAllContacts,
} from '@/shared/modules/brevo/interface/brevo.interface';

@Injectable()
export class NewsletterService {
  constructor(private readonly newsletterProvider: NewsletterProvider) {}

  async subscribe(ctx: ICreateContact) {
    return await this.newsletterProvider.subscribe(ctx);
  }

  async fetchAllSubscribers(ctx: IFetchAllContacts) {
    return await this.newsletterProvider.fetchAllSubscribers(ctx);
  }
}
