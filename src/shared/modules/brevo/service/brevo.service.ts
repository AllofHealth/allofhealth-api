import { Injectable } from '@nestjs/common';
import { BrevoProvider } from '../provider/brevo.provider';
import {
  ICreateContact,
  IFetchAllContacts,
} from '../interface/brevo.interface';

@Injectable()
export class BrevoService {
  constructor(private readonly brevoProvider: BrevoProvider) {}

  async createContact(ctx: ICreateContact) {
    return await this.brevoProvider.createContact(ctx);
  }

  async fetchAllContacts(ctx: IFetchAllContacts) {
    return await this.brevoProvider.getAllContacts(ctx);
  }
}
