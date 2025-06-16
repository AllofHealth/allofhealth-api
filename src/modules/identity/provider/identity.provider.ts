import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  BadRequestException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { IStoreIdentification } from '../interface/identity.interface';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  IDENTITY_ERROR_MESSAGES as IEM,
  IDENTITY_SUCCESS_MESSAGES as ISM,
} from '../data/identity.data';
import { IdentityError } from '../error/identity.error';

@Injectable()
export class IdentityProvider {
  private handler: ErrorHandler;
  constructor(@Inject(DRIZZLE_PROVIDER) private readonly db: Database) {
    this.handler = new ErrorHandler();
  }

  async storeId(ctx: IStoreIdentification) {
    try {
      switch (ctx.role) {
        case 'PATIENT':
          await this.db
            .insert(schema.identity)
            .values({
              userId: ctx.userId,
              governmentId: ctx.governmentId,
              governmentFileId: ctx.governmentFileId,
              role: ctx.role,
            })
            .onConflictDoUpdate({
              target: schema.identity.userId,
              set: {
                governmentFileId: ctx.governmentFileId,
                governmentId: ctx.governmentId,
              },
            });

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: ISM.SUCCESS_STORING_IDENTIFICATION,
          });
        case 'DOCTOR':
          if (ctx.scannedLicense) {
            throw new BadRequestException(
              new IdentityError(
                'Please provide a copy of your medical license',
                HttpStatus.BAD_REQUEST,
              ),
            );
          }

          await this.db
            .insert(schema.identity)
            .values({
              userId: ctx.userId,
              governmentFileId: ctx.governmentFileId,
              governmentId: ctx.governmentId,
              scannedLicenseFileId: ctx.scannedLicenseFileId,
              scannedLicense: ctx.scannedLicense,
              role: ctx.role,
            })
            .onConflictDoUpdate({
              target: schema.identity.userId,
              set: {
                governmentId: ctx.governmentId ? ctx.governmentId : null,
                governmentFileId: ctx.governmentFileId
                  ? ctx.governmentFileId
                  : null,
                scannedLicenseFileId: ctx.scannedLicenseFileId
                  ? ctx.scannedLicenseFileId
                  : null,
                scannedLicense: ctx.scannedLicense ? ctx.scannedLicense : null,
              },
            });

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: ISM.SUCCESS_STORING_IDENTIFICATION,
          });
        case 'ADMIN':
          if (ctx.scannedLicense) {
            throw new BadRequestException(
              new IdentityError(
                'Please provide a copy of your medical license',
                HttpStatus.BAD_REQUEST,
              ),
            );
          }

          await this.db.insert(schema.identity).values({
            userId: ctx.userId,
            governmentId: ctx.governmentId,
            scannedLicense: ctx.scannedLicense!,
            role: ctx.role,
          });

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: ISM.SUCCESS_STORING_IDENTIFICATION,
          });
      }
    } catch (e) {
      return this.handler.handleError(e, IEM.ERROR_STORING_IDENTIFICATION);
    }
  }
}
