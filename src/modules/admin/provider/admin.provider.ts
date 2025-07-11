import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { Inject, Injectable } from '@nestjs/common';
import { ICreateAdmin } from '../interface/admin.interface';
import {
  ADMIN_ERROR_MESSAGES as AEM,
  ADMIN_SUCCESS_MESSAGES as ASM,
} from '../data/admin.data';
import { AuthUtils } from '@/shared/utils/auth.utils';

@Injectable()
export class AdminProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly authUtils: AuthUtils,
  ) {}

  async createSuperAdmin(ctx: ICreateAdmin) {
    const { userName, password, permissionLevel = 'super' } = ctx;
    try {
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_ADMIN);
    }
  }
}
