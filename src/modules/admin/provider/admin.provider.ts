import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ICreateAdmin, ICreateSystemAdmin } from '../interface/admin.interface';
import {
  ADMIN_ERROR_MESSAGES as AEM,
  ADMIN_SUCCESS_MESSAGES as ASM,
} from '../data/admin.data';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';

@Injectable()
export class AdminProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly authUtils: AuthUtils,
  ) {}

  private async validateIsSuperAdmin(adminId: string) {
    let isValidated: boolean = false;
    try {
      const superAdminResult = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (superAdminResult && superAdminResult.permissionLevel === 'super') {
        isValidated = true;
      }

      return isValidated;
    } catch (e) {
      throw new HttpException(
        AEM.ERROR_VALIDATING_SUPER_ADMIN,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAdminById(adminId: string) {
    try {
      const admin = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (!admin) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ADMIN_NOT_FOUND,
        });
      }

      const strippedAdmin = {
        id: admin.id,
        email: admin.email,
        userName: admin.userName,
        permissions: admin.permissionLevel,
      };

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.ADMIN_FOUND,
        data: strippedAdmin,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_FINDING_ADMIN);
    }
  }

  async findAdminByEmail(email: string) {
    try {
      const admin = await this.db.query.admin.findFirst({
        where: eq(schema.admin.email, email),
      });

      if (!admin) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ADMIN_NOT_FOUND,
        });
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.ADMIN_FOUND,
        data: admin,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_FINDING_ADMIN);
    }
  }

  async createSuperAdmin(ctx: ICreateAdmin) {
    const { userName, password, email, permissionLevel = 'super' } = ctx;
    try {
      const admin = await this.findAdminByEmail(email);

      if (admin.status === HttpStatus.OK) {
        return this.handler.handleReturn({
          status: HttpStatus.CONFLICT,
          message: AEM.ADMIN_EXISTS,
        });
      }

      const hashedPassword = await this.authUtils.hash(password);

      await this.db.insert(schema.admin).values({
        userName,
        email,
        password: hashedPassword,
        permissionLevel,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUPER_ADMIN_CREATED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_ADMIN);
    }
  }

  async createSystemAdmin(ctx: ICreateSystemAdmin) {
    const {
      superAdminId,
      userName,
      password,
      email,
      permissionLevel = 'system',
    } = ctx;
    try {
      const [isSuperAdmin, isAdminExists] = await Promise.all([
        this.validateIsSuperAdmin(superAdminId),
        this.findAdminByEmail(email),
      ]);

      if (!isSuperAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      if (isAdminExists.status === HttpStatus.OK) {
        return this.handler.handleReturn({
          status: HttpStatus.CONFLICT,
          message: AEM.ADMIN_EXISTS,
        });
      }

      const hashedPassword = await this.authUtils.hash(password);

      await this.db.insert(schema.admin).values({
        userName,
        email,
        password: hashedPassword,
        permissionLevel,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_CREATING_ADMIN,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_CREATING_ADMIN);
    }
  }
}
