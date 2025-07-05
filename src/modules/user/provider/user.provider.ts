import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { eq } from 'drizzle-orm';
import { IUploadIdentityFile } from '@/modules/asset/interface/asset.interface';
import { AssetService } from '@/modules/asset/service/asset.service';
import { ICreateDoctor } from '@/modules/doctor/interface/doctor.interface';
import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import {
  CreateDoctor,
  CreateSmartAccount,
  DeleteUser,
  EHandleRegisterPatient,
  ERegisterEntity,
} from '@/shared/dtos/event.dto';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { CreateSmartAccountQueue } from '@/shared/queues/account/account.queue';
import { AuthUtils } from '@/shared/utils/auth.utils';
import {
  USER_ERROR_MESSAGES as UEM,
  USER_SUCCESS_MESSAGE as USM,
} from '../data/user.data';
import { UserError } from '../error/user.error';
import {
  ICreateUser,
  IHandleDoctorRegistration,
  IUpdateUser,
  IUserSnippet,
} from '../interface/user.interface';

@Injectable()
export class UserProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly authUtils: AuthUtils,
    private readonly eventEmitter: EventEmitter2,
    private readonly createSmartAccountQueue: CreateSmartAccountQueue,
    private readonly assetService: AssetService,
    private readonly handler: ErrorHandler,
  ) {}

  private async emitEvent(ctx: ICreateDoctor) {
    try {
      await this.eventEmitter.emitAsync(
        SharedEvents.CREATE_DOCTOR,
        new CreateDoctor(
          ctx.userId,
          ctx.specialization,
          ctx.medicalLicenseNumber,
          ctx.yearsOfExperience,
          ctx.hospitalAssociation,
          ctx.locationOfHospital,
          ctx.languagesSpoken,
          ctx.licenseExpirationDate,
          ctx.certifications,
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

  private async emitStoreIdentity(ctx: IUploadIdentityFile) {
    try {
      return await this.assetService.uploadIdentityAssets(ctx);
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
        console.log('user not found');
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
        password: user[0].password,
        isFirstimeUser: user[0].isFirstTime,
      };

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

  @OnEvent(SharedEvents.PATIENT_REGISTRATION, { async: true })
  private async handlePatientRegistration(ctx: EHandleRegisterPatient) {
    const { userId, governmentIdFilePath } = ctx;
    try {
      await this.emitStoreIdentity({
        userId,
        role: 'PATIENT',
        governmentIdFilePath,
      });

      await this.eventEmitter.emitAsync(
        SharedEvents.CREATE_SMART_ACCOUNT,
        new CreateSmartAccount(userId),
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.eventEmitter.emit(
        SharedEvents.ADD_PATIENT_TO_CONTRACT,
        new ERegisterEntity(userId),
      );
    } catch (e) {
      await this.deleteUser({
        userId,
      });
      throw new HttpException(
        `${UEM.ERROR_HANDLING_PATIENT_REGISTRATION}, ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async handleDoctorRegistration(ctx: IHandleDoctorRegistration) {
    const { userId, governmentIdFilePath, scannedLicenseFilePath } = ctx;
    try {
      await this.emitStoreIdentity({
        userId,
        role: 'DOCTOR',
        governmentIdFilePath,
        scannedLicenseFilePath,
      });

      await this.eventEmitter.emitAsync(
        SharedEvents.CREATE_SMART_ACCOUNT,
        new CreateSmartAccount(userId),
      );

      await new Promise((resolve) => setTimeout(resolve, 3000));

      this.eventEmitter.emit(
        SharedEvents.ADD_DOCTOR_TO_CONTRACT,
        new ERegisterEntity(userId),
      );
    } catch (e) {
      await this.deleteUser({
        userId,
      });
      throw new HttpException(
        `${UEM.ERROR_HANDLING_DOCTOR_REGISTRATION}, ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @todo Abstract role creation to it's own process and handle rollback on process fail
   * @param ctx
   * @returns
   */
  async createUser(ctx: ICreateUser) {
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
          await this.eventEmitter.emitAsync(
            SharedEvents.PATIENT_REGISTRATION,
            new EHandleRegisterPatient(
              insertedUser.id,
              ctx.governmentIdfilePath,
            ),
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
            certifications: ctx.certifications,
            hospitalAssociation: ctx.hospitalAssociation!,
            languagesSpoken: ctx.languagesSpoken!,
            licenseExpirationDate: ctx.licenseExpirationDate!,
            locationOfHospital: ctx.locationOfHospital!,
            medicalLicenseNumber: ctx.medicalLicenseNumber!,
            specialization: ctx.specialization!,
            yearsOfExperience: ctx.yearsOfExperience!,
          });

          await this.handleDoctorRegistration({
            userId: insertedUser.id,
            governmentIdFilePath: ctx.governmentIdfilePath,
            scannedLicenseFilePath: ctx.scannedLicensefilePath!,
          });

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

  async updateUser(ctx: IUpdateUser) {
    const {
      userId,
      fullName,
      dateOfBirth,
      profilePictureFilePath,
      emailAddress,
      gender,
      hospitalAssociation,
      locationOfHospital,
      medicalLicenseNumber,
      availability,
      password,
      phoneNumber,
      specialization,
      lastLogin,
      lastActivity,
      authProvider,
    } = ctx;
    try {
      const userResult = await this.findUserById(userId);
      if (!('data' in userResult && userResult.data && userResult)) {
        throw new HttpException(UEM.USER_NOT_FOUND, HttpStatus.NOT_FOUND);
      }

      if (
        (hospitalAssociation ||
          locationOfHospital ||
          medicalLicenseNumber ||
          specialization) &&
        userResult.data.role !== 'DOCTOR'
      ) {
        return this.handler.handleReturn({
          status: HttpStatus.BAD_REQUEST,
          message: UEM.INVALID_ROLE,
        });
      }

      const dataToUpdate: Record<string, any> = {};
      const doctorDataToUpdate: Record<string, any> = {};

      if (fullName) dataToUpdate.fullName = fullName;
      if (emailAddress) dataToUpdate.emailAddress = emailAddress;
      if (dateOfBirth) dataToUpdate.dateOfBirth = dateOfBirth;
      if (gender) dataToUpdate.gender = gender;
      if (password) {
        const hashedPassword = await this.authUtils.hash(password);
        dataToUpdate.password = hashedPassword;
      }
      if (phoneNumber) dataToUpdate.phoneNumber = phoneNumber;
      if (lastLogin) dataToUpdate.lastLogin = lastLogin;
      if (lastActivity) dataToUpdate.lastActivity = lastActivity;
      if (authProvider) dataToUpdate.authProvider = authProvider;

      if (hospitalAssociation)
        doctorDataToUpdate.hospitalAssociation = hospitalAssociation;
      if (locationOfHospital)
        doctorDataToUpdate.locationOfHospital = locationOfHospital;
      if (medicalLicenseNumber)
        doctorDataToUpdate.medicalLicenseNumber = medicalLicenseNumber;
      if (specialization) doctorDataToUpdate.specialization = specialization;
      if (availability) doctorDataToUpdate.availability = availability;

      if (emailAddress && emailAddress !== userResult.data.email) {
        const emailExists = await this.validateEmailAddress(emailAddress);
        if (emailExists) {
          return this.handler.handleReturn({
            status: HttpStatus.CONFLICT,
            message: UEM.EMAIL_EXIST,
          });
        }
      }

      if (profilePictureFilePath) {
        const result = await this.assetService.uploadProfilePicture({
          userId,
          profilePictureFilePath,
        });

        if (!('data' in result && result.data)) {
          return this.handler.handleReturn({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: UEM.ERROR_UPDATING_USER,
          });
        }

        const profilePicture = result.data.url;
        dataToUpdate.profilePicture = profilePicture;
      }

      await this.db
        .update(schema.user)
        .set(dataToUpdate)
        .where(eq(schema.user.id, userId));

      if (doctorDataToUpdate && Object.keys(doctorDataToUpdate).length > 0) {
        await this.db
          .update(schema.doctors)
          .set(doctorDataToUpdate)
          .where(eq(schema.doctors.userId, userId));
      }

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: USM.USER_UPDATED,
      });
    } catch (e) {
      return this.handler.handleError(e, UEM.ERROR_UPDATING_USER);
    }
  }
}
