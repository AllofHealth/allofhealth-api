import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  ICreateContact,
  IFetchAllContacts,
} from '@/shared/modules/brevo/interface/brevo.interface';
import { BrevoService } from '@/shared/modules/brevo/service/brevo.service';
import { HttpStatus, Injectable } from '@nestjs/common';
import {
  NEWS_LETTER_ERROR_MESSAGES as NEM,
  NEWS_LETTER_SUCCESS_MESSGAES as NSM,
} from '../data/newsletter.data';

@Injectable()
export class NewsletterProvider {
  constructor(
    private readonly brevoService: BrevoService,
    private readonly handler: ErrorHandler,
  ) {}

  async subscribe(ctx: ICreateContact) {
    try {
      const data = await this.brevoService.createContact(ctx);
      if (data.status !== HttpStatus.OK) {
        return this.handler.handleReturn({
          status: data.status,
          message: data.message,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: NSM.SUCCESS_SUBSCRIBING,
        data: data.data,
      });
    } catch (e) {
      return this.handler.handleError(e, NEM.ERROR_SUBSCRIBING);
    }
  }

  async fetchAllSubscribers(ctx: IFetchAllContacts) {
    try {
      const data = await this.brevoService.fetchAllContacts(ctx);
      if (data.status !== HttpStatus.OK) {
        return this.handler.handleReturn({
          status: data.status,
          message: data.message,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: NSM.SUCCESS_FETCHING_SUBSCRIBERS,
        data: data.data,
      });
    } catch (e) {
      return this.handler.handleError(e, NEM.ERROR_FETCHING_SUBSCRIBERS);
    }
  }
}
