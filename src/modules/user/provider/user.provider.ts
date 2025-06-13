import * as schema from '@/schemas/schema';
import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { err, ok, ResultAsync } from 'neverthrow';
import { USER_ERROR_MESSAGES } from '../data/user.data';
import { UserError } from '../error/user.error';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { CreateUserType, ICreateUser } from '../interface/user.interface';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { SharedEvents } from '@/shared/events/shared.events';
import { CreateDoctor, DeleteUser } from '@/shared/dtos/event.dto';
import { ICreateDoctor } from '@/modules/doctor/interface/doctor.interface';

@Injectable()
export class UserProvider {
  constructor(
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
    private readonly authUtils: AuthUtils,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  validateEmailAddress(emailAddress: string) {
    return this.findUserByEmail(emailAddress)
      .map(() => true)
      .orElse((error) => {
        if (error.message.includes(USER_ERROR_MESSAGES.USER_NOT_FOUND)) {
          return ok(false);
        }
        return err(error);
      });
  }

  findUserByEmail(emailAddress: string) {
    const result = ResultAsync.fromPromise(
      this.db
        .select()
        .from(schema.user)
        .where(eq(schema.user.emailAddress, emailAddress)),
      (error: Error) =>
        new UserError(`Failed to find user by email ${error.message}`),
    ).andThen((users) => {
      if (!users || users.length === 0) {
        return err(new UserError(USER_ERROR_MESSAGES.USER_NOT_FOUND));
      }

      return ok(users[0]);
    });

    return result;
  }

  findUserById(id: string) {
    return ResultAsync.fromPromise(
      this.db.select().from(schema.user).where(eq(schema.user.id, id)),
      (error: Error) =>
        new UserError(`Failed to find user by id ${error.message}`),
    ).andThen((user) => {
      if (!user) {
        return err(new UserError(USER_ERROR_MESSAGES.USER_NOT_FOUND));
      }

      return ok(user[0]);
    });
  }

  @OnEvent(SharedEvents.DELETE_USER)
  deleteUser(ctx: DeleteUser) {
    return ResultAsync.fromPromise(
      this.db.delete(schema.user).where(eq(schema.user.id, ctx.userId)),
      (error: Error) =>
        new UserError(`Failed to delete user by id ${error.message}`),
    ).andThen(() => {
      return ok(true);
    });
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

      return ok(true);
    } catch (error) {
      //handle rollback
      this.eventEmitter.emit(
        SharedEvents.DELETE_USER,
        new DeleteUser(ctx.userId),
      );
      return err(new Error(`Failed to emit event ${error}`));
    }
  }

  async createUser(ctx: ICreateUser): CreateUserType {
    const hashedPassword = await this.authUtils.hash(ctx.password);
    return this.validateEmailAddress(ctx.emailAddress).andThen((userExists) => {
      if (userExists) {
        return err(new UserError(USER_ERROR_MESSAGES.USER_EXISTS));
      }

      const dateOfBirthString = ctx.dateOfBirth.toISOString().split('T')[0];

      return ResultAsync.fromPromise(
        this.db
          .insert(schema.user)
          .values({
            fullName: ctx.fullName,
            emailAddress: ctx.emailAddress,
            dateOfBirth: dateOfBirthString,
            gender: ctx.gender,
            password: hashedPassword,
            phoneNumber: ctx.phoneNumber,
            role: ctx.role,
          })
          .returning(),
        (error: Error) =>
          new UserError(
            `${USER_ERROR_MESSAGES.ERROR_CREATE_USER} ${error.message}`,
          ),
      ).andThen((insertedUser) => {
        if (!insertedUser[0]) {
          return err(new UserError(USER_ERROR_MESSAGES.ERROR_CREATE_USER));
        }

        const user = insertedUser[0];

        switch (ctx.role) {
          case 'PATIENT':
            return ok(user).map((user) => ({
              userId: user.id,
              fullName: user.fullName,
              profilePicture: user.profilePicture as string,
              email: user.emailAddress,
              role: user.role,
              gender: user.gender,
            }));
          case 'DOCTOR':
            return ResultAsync.fromPromise(
              this.emitEvent({
                userId: insertedUser[0].id,
                certifications: ctx.certifications!,
                hospitalAssociation: ctx.hospitalAssociation!,
                languagesSpoken: ctx.languagesSpoken!,
                licenseExpirationDate: ctx.licenseExpirationDate!,
                locationOfHospital: ctx.locationOfHospital!,
                medicalLicenseNumber: ctx.medicalLicenseNumber!,
                scannedLicenseUrl: ctx.scannedLicenseUrl!,
                specialization: ctx.specialization!,
                yearsOfExperience: ctx.yearsOfExperience!,
              }),
              (error: Error) =>
                new UserError(
                  `${USER_ERROR_MESSAGES.ERROR_CREATE_USER} ${error.message}`,
                ),
            ).andThen((result) => {
              if (result.isOk()) {
                return ok(insertedUser[0]).map((user) => ({
                  userId: user.id,
                  fullName: user.fullName,
                  profilePicture: user.profilePicture as string,
                  email: user.emailAddress,
                  role: user.role,
                  gender: user.gender,
                }));
              } else {
                return err(new UserError(result.error.message));
              }
            });

          default:
            return err(new UserError('Handlers for other roles not available'));
        }
      });
    });
  }
}
