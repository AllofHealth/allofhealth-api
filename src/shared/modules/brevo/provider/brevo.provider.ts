import { BrevoConfig } from '@/shared/config/brevo/brevo.config';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import {
  ICreateContact,
  IFetchAllContacts,
  IGetBrevoOptions,
} from '../interface/brevo.interface';
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

  private async getContactInfo(emailAddress: string) {
    const url = `${CONTACT_PATH.CONTACTS}/${emailAddress}`;
    const options = this.getBrevoOptions({
      method: 'GET',
    });
    try {
      const response = await fetch(url, options as Object);
      const data = await response.json();
      if (response.ok) {
        if (data && data.email === emailAddress) {
          return true;
        }
      }

      return false;
    } catch (e) {
      throw new HttpException(
        new BrevoError(BEM.ERROR_CREATING_CONTACT),
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: e },
      );
    }
  }

  async createContact(ctx: ICreateContact) {
    try {
      const options = this.getBrevoOptions({
        method: 'POST',
        body: {
          email: ctx.emailAddress,
        },
      });

      const hasSubscribed = await this.getContactInfo(ctx.emailAddress);
      if (hasSubscribed) {
        throw new ConflictException('Already subscribed');
      }

      const response = await fetch(CONTACT_PATH.CONTACTS, options as Object);
      const data = await response.json();
      if (response.ok) {
        return {
          status: HttpStatus.OK,
          message: BSM.SUCCESS_CREATING_CONTACT,
          data: data,
        };
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

  async getAllContacts(ctx: IFetchAllContacts) {
    const { limit = 100, offset = 0, sort = 'ASC' } = ctx;
    const url = `${CONTACT_PATH.CONTACTS}?limit=${limit}&offset=${offset}&sort=${sort}`;

    try {
      const options = this.getBrevoOptions({
        method: 'GET',
      });

      const response = await fetch(url, options as Object);
      const data = await response.json();
      if (response.ok) {
        return {
          status: HttpStatus.OK,
          message: BSM.SUCCESS_FETCHING_CONTACTS,
          data: data.contacts,
        };
      }
      throw new HttpException(
        new BrevoError(BEM.ERROR_FETCHING_CONTACTS),
        HttpStatus.BAD_REQUEST,
        { cause: data },
      );
    } catch (e) {
      throw new HttpException(
        new BrevoError(BEM.ERROR_FETCHING_CONTACTS),
        HttpStatus.BAD_REQUEST,
        { cause: e },
      );
    }
  }
}
