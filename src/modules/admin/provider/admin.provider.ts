import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IAdminLogin,
  ICreateAdmin,
  ICreateSystemAdmin,
  IDeleteAdmin,
  IManagePermissions,
  IVerifyPractitioner,
} from '../interface/admin.interface';
import {
  ADMIN_ERROR_MESSAGES as AEM,
  ADMIN_SUCCESS_MESSAGES as ASM,
} from '../data/admin.data';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { eq } from 'drizzle-orm';
import * as schema from '@/schemas/schema';
import { AuthService } from '@/modules/auth/service/auth.service';
import { DoctorService } from '@/modules/doctor/service/doctor.service';
import { DOCTOR_ERROR_MESSGAES } from '@/modules/doctor/data/doctor.data';

@Injectable()
export class AdminProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly handler: ErrorHandler,
    private readonly authUtils: AuthUtils,
    private readonly authService: AuthService,
    private readonly doctorService: DoctorService,
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

  private async validateIsAdmin(adminId: string) {
    let isValidated: boolean = false;
    try {
      const adminResult = await this.db.query.admin.findFirst({
        where: eq(schema.admin.id, adminId),
      });

      if (adminResult && adminResult.permissionLevel === 'system') {
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

  private async verifyDoctor(doctorId: string) {
    try {
      const doctor = await this.doctorService.fetchDoctor(doctorId);
      if (!doctor || doctor.status !== HttpStatus.OK || !('data' in doctor)) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: DOCTOR_ERROR_MESSGAES.DOCTOR_NOT_FOUND,
        });
      }

      const isVerified = doctor.data?.isVerified;
      if (isVerified) {
        return this.handler.handleReturn({
          status: HttpStatus.OK,
          message: ASM.PRACTITIONER_VERIFIED,
        });
      }

      await this.db
        .update(schema.doctors)
        .set({
          isVerified: true,
        })
        .where(eq(schema.doctors.userId, doctorId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.PRACTITIONER_VERIFIED,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_VERIFYING_PRACTITIONER);
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

  async managePermissions(ctx: IManagePermissions) {
    const { superAdminId, adminId, permissionLevel } = ctx;
    try {
      const [isSuperAdmin, isAdmin] = await Promise.all([
        this.validateIsSuperAdmin(superAdminId),
        this.validateIsAdmin(adminId),
      ]);

      if (!isSuperAdmin || !isAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      await this.db
        .update(schema.admin)
        .set({ permissionLevel })
        .where(eq(schema.admin.id, adminId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_UPDATING_ADMIN_PERMISSIONS,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_UPDATING_ADMIN_PERMISSIONS);
    }
  }

  async adminLogin(ctx: IAdminLogin) {
    const { email, password } = ctx;
    try {
      const admin = await this.findAdminByEmail(email);

      if (!admin || admin.status !== HttpStatus.OK || !('data' in admin)) {
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: AEM.ADMIN_NOT_FOUND,
        });
      }

      const isPasswordValid = await this.authUtils.compare({
        hashedPassword: admin.data?.password!,
        password,
      });

      if (!isPasswordValid) {
        return this.handler.handleReturn({
          status: HttpStatus.UNAUTHORIZED,
          message: AEM.INVALID_ADMIN_PASSWORD,
        });
      }

      const tokens = await this.authService.generateTokens({
        email,
        userId: admin.data?.id!,
      });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_LOGGING_IN_AS_ADMIN,
        data: {
          id: admin.data?.id!,
          email: admin.data?.email!,
          permissionLevel: admin.data?.permissionLevel!,
          ...tokens,
        },
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_LOGGING_IN_AS_ADMIN);
    }
  }

  async verifyPractitioner(ctx: IVerifyPractitioner) {
    switch (ctx.role) {
      case 'doctor':
        return await this.verifyDoctor(ctx.practitionerId);
      case 'pharmacist':
        return 'Not Implemented';
      default:
        throw new BadRequestException('Invalid role');
    }
  }

  async deleteAdmin(ctx: IDeleteAdmin) {
    const { superAdminId, adminId } = ctx;
    try {
      const isSuperAdmin = await this.validateIsSuperAdmin(superAdminId);
      if (!isSuperAdmin) {
        throw new UnauthorizedException('Unauthorized');
      }

      await this.db.delete(schema.admin).where(eq(schema.admin.id, adminId));

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: ASM.SUCCESS_DELETING_ADMIN,
      });
    } catch (e) {
      return this.handler.handleError(e, AEM.ERROR_DELETING_ADMIN);
    }
  }
}
