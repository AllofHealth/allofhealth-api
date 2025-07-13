import { Injectable } from '@nestjs/common';
import {
  IAdminLogin,
  ICreateAdmin,
  ICreateSystemAdmin,
  IDeleteAdmin,
  IManagePermissions,
  IVerifyPractitioner,
} from '../interface/admin.interface';
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

  async managePermissions(ctx: IManagePermissions) {
    return await this.adminProvider.managePermissions(ctx);
  }

  async adminLogin(ctx: IAdminLogin) {
    return await this.adminProvider.adminLogin(ctx);
  }

  async verifyPractitioner(ctx: IVerifyPractitioner) {
    return await this.adminProvider.verifyPractitioner(ctx);
  }
  async deleteAdmin(ctx: IDeleteAdmin) {
    return await this.adminProvider.deleteAdmin(ctx);
  }
}
