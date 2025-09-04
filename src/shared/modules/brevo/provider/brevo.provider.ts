import { BrevoConfig } from '@/shared/config/brevo/brevo.config';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ICreateContact, IGetBrevoOptions } from '../interface/brevo.interface';
import { BrevoError } from '../error/brevo.error';
import {
  BREVO_ERROR_MESSAGES as BEM,
  BREVO_SUCCESS_MESSAGES as BSM,
  CONTACT_PATH,
} from '../data/brevo.data';

@Injectable()
export class BrevoProvider {
  constructor(private readonly brevoConfig: BrevoConfig) {}

  private getBrevoOptions(ctx: IGetBrevoOptions) {
    const { method, body } = ctx;
    if (method === 'POST' && !body) {
      throw new BadRequestException('Body is required for POST method');
    }

    if (method === 'POST') {
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
    }

    if (method === 'GET') {
      return {
        method: method,
        headers: {
          accept: 'application/json',
          'api-key': this.brevoConfig.BREVO_API_KEY,
        },
      };
    }
    throw new HttpException(
      new BrevoError('Invalid Method'),
      HttpStatus.BAD_REQUEST,
    );
  }

  async createContact(ctx: ICreateContact) {
    try {
      const options = this.getBrevoOptions({
        method: 'POST',
        body: {
          email: ctx.emailAddress,
        },
      });

      const response = await fetch(CONTACT_PATH.CONTACTS, options as Object);
      const data = await response.json();
      if (response.ok) {
        return data;
      }
      throw new HttpException(
        new BrevoError(BEM.ERROR_CREATING_CONTACT),
        HttpStatus.BAD_REQUEST,
        { cause: data },
      );
    } catch (e) {
      throw new HttpException(
        new BrevoError(BEM.ERROR_CREATING_CONTACT),
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }
}
