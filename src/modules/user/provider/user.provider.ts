import { ICreateDoctor } from '@/modules/doctor/interface/doctor.interface';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  CreateDoctor,
  CreateSmartAccount,
  DeleteUser,
  StoreId,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { CreateSmartAccountQueue } from '@/shared/queues/account/account.queue';
import { AuthUtils } from '@/shared/utils/auth.utils';
import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import {
  USER_ERROR_MESSAGES as UEM,
  USER_SUCCESS_MESSAGE as USM,
} from '../data/user.data';
import { UserError } from '../error/user.error';
import { ICreateUser, IUserSnippet } from '../interface/user.interface';

@Injectable()
export class UserProvider {
  private handler: ErrorHandler;
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly authUtils: AuthUtils,
    private readonly eventEmitter: EventEmitter2,
    private readonly createSmartAccountQueue: CreateSmartAccountQueue,
  ) {
    this.handler = new ErrorHandler();
  }

  private async emitEvent(ctx: ICreateDoctor) {
    try {
      await this.eventEmitter.emitAsync(
        SharedEvents.CREATE_DOCTOR,
        new CreateDoctor(
          ctx.userId,
          ctx.specialization,
          ctx.medicalLicenseNumber,
          ctx.scannedLicenseUrl,
          ctx.yearsOfExperience,
          ctx.certifications,
          ctx.hospitalAssociation,
          ctx.locationOfHospital,
          ctx.languagesSpoken,
          ctx.licenseExpirationDate,
        ),
      );
    } catch (error) {
      //handle rollback
      this.eventEmitter.emit(
        SharedEvents.DELETE_USER,
        new DeleteUser(ctx.userId),
      );
      return this.handler.handleError(error, 'Failed to emit event');
    }
  }

  private async emitStoreIdentity(ctx: StoreId) {
    try {
      this.eventEmitter.emit(
        SharedEvents.STORE_IDENTIFICATION,
        new StoreId(
          ctx.userId,
          ctx.governmentId,
          ctx.role,
          ctx.scannedLicenseUrl,
        ),
      );
    } catch (error) {
      await this.db
        .delete(schema.identity)
        .where(eq(schema.identity.userId, ctx.userId));
      return this.handler.handleError(
        error,
        'Failed to emit event to store identity',
      );
    }
  }

  async validateEmailAddress(emailAddress: string) {
    const user = await this.findUserByEmail(emailAddress);
    if (user.status === HttpStatus.OK) {
      return true;
    }

    return false;
  }

  async findUserByEmail(emailAddress: string) {
    try {
      const user = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.emailAddress, emailAddress))
        .limit(1);

      if (!user || user.length === 0) {
        console.log(`user not found`);
        return this.handler.handleReturn({
          status: HttpStatus.NOT_FOUND,
          message: UEM.USER_NOT_FOUND,
          data: null,
        });
      }

      const usersnippet = {
        userId: user[0].id,
        fullName: user[0].fullName,
        email: user[0].emailAddress,
        gender: user[0].gender,
        profilePicture: user[0].profilePicture,
        role: user[0].role,
      } as IUserSnippet;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: USM.USER_FETCHED_SUCCESSFULLY,
        data: usersnippet,
      });
    } catch (e) {
      return this.handler.handleError(e, UEM.ERROR_FETCHING_USER);
    }
  }

  async findUserById(id: string) {
    try {
      const user = await this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.id, id))
        .limit(1);

      const parsedUser = {
        userId: user[0].id,
        fullName: user[0].fullName,
        email: user[0].emailAddress,
        gender: user[0].gender,
        profilePicture: user[0].profilePicture,
        role: user[0].role,
      } as IUserSnippet;

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: USM.USER_FETCHED_SUCCESSFULLY,
        data: parsedUser,
      });
    } catch (e) {
      return this.handler.handleError(e, UEM.ERROR_FETCHING_USER);
    }
  }

  @OnEvent(SharedEvents.DELETE_USER)
  async deleteUser(ctx: DeleteUser) {
    try {
      await this.db.delete(schema.user).where(eq(schema.user.id, ctx.userId));
      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: USM.USER_DELETED_SUCCESSFULLY,
      });
    } catch (e) {
      return this.handler.handleError(e, UEM.ERROR_DELETING_USER);
    }
  }

  async createUser(ctx: ICreateUser) {
    console.log('provider is hitting');

    try {
      const hashedPassword = await this.authUtils.hash(ctx.password);

      const emailExists = await this.validateEmailAddress(ctx.emailAddress);

      if (emailExists) {
        return this.handler.handleReturn({
          status: HttpStatus.FOUND,
          message: UEM.USER_EXISTS,
        });
      }

      const dateOfBirthString =
        typeof ctx.dateOfBirth === 'string'
          ? ctx.dateOfBirth
          : ctx.dateOfBirth.toISOString().split('T')[0];
      const user = await this.db
        .insert(schema.user)
        .values({
          fullName: ctx.fullName,
          emailAddress: ctx.emailAddress,
          dateOfBirth: dateOfBirthString,
          gender: ctx.gender,
          password: hashedPassword,
          phoneNumber: ctx.phoneNumber,
          authProvider: ctx.authProvider,
          role: ctx.role,
        })
        .returning();

      if (!user[0]) {
        throw new HttpException(
          UEM.ERROR_CREATE_USER,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const insertedUser = user[0];
      let parsedUser: IUserSnippet = {
        userId: '',
        fullName: '',
        email: '',
        profilePicture: '',
        gender: '',
        role: '',
      };

      switch (ctx.role) {
        case 'PATIENT':
          await this.emitStoreIdentity({
            userId: insertedUser.id,
            role: 'PATIENT',
            governmentId: ctx.governmentIdUrl,
          });

          await this.createSmartAccountQueue.createSmartAccountJob(
            new CreateSmartAccount(insertedUser.id),
          );

          parsedUser = {
            userId: insertedUser.id,
            fullName: ctx.fullName,
            email: ctx.emailAddress,
            profilePicture: insertedUser.profilePicture as string,
            gender: ctx.gender,
            role: ctx.role,
          };

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: USM.USER_CREATED,
            data: parsedUser,
          });
        case 'DOCTOR':
          await this.emitEvent({
            userId: insertedUser.id,
            certifications: ctx.certifications!,
            hospitalAssociation: ctx.hospitalAssociation!,
            languagesSpoken: ctx.languagesSpoken!,
            licenseExpirationDate: ctx.licenseExpirationDate!,
            locationOfHospital: ctx.locationOfHospital!,
            medicalLicenseNumber: ctx.medicalLicenseNumber!,
            scannedLicenseUrl: ctx.scannedLicenseUrl!,
            specialization: ctx.specialization!,
            yearsOfExperience: ctx.yearsOfExperience!,
          });

          await this.emitStoreIdentity({
            userId: insertedUser.id,
            role: 'DOCTOR',
            governmentId: ctx.governmentIdUrl,
            scannedLicenseUrl: ctx.scannedLicenseUrl!,
          });

          await this.createSmartAccountQueue.createSmartAccountJob(
            new CreateSmartAccount(insertedUser.id),
          );

          parsedUser = {
            userId: insertedUser.id,
            fullName: ctx.fullName,
            email: ctx.emailAddress,
            profilePicture: insertedUser.profilePicture as string,
            gender: ctx.gender,
            role: ctx.role,
          };

          return this.handler.handleReturn({
            status: HttpStatus.OK,
            message: USM.USER_CREATED,
            data: parsedUser,
          });

        default:
          throw new BadRequestException(
            new UserError('Role not implemented', HttpStatus.BAD_REQUEST),
          );
      }
    } catch (e) {
      return this.handler.handleError(e, UEM.ERROR_CREATE_USER);
    }
  }
}
