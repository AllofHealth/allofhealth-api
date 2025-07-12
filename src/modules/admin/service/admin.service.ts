import { Injectable } from '@nestjs/common';
import { ICreateAdmin, ICreateSystemAdmin } from '../interface/admin.interface';
import { AdminProvider } from '../provider/admin.provider';

@Injectable()
export class AdminService {
  constructor(private readonly adminProvider: AdminProvider) {}

  async createSuperAdmin(ctx: ICreateAdmin) {
    return await this.adminProvider.createSuperAdmin(ctx);
  }

  async createSystemAdmin(ctx: ICreateSystemAdmin) {
    return await this.adminProvider.createSystemAdmin(ctx);
  }
}
