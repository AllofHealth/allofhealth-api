import { DRIZZLE_PROVIDER } from '@/shared/drizzle/drizzle.provider';
import { Database } from '@/shared/drizzle/drizzle.types';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { SharedEvents } from '@/shared/events/shared.events';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as OTPAuth from 'otpauth';
import {
  OTP_ERROR_MESSAGES as OEM,
  OTP_SUCCESS_MESSAGES as OSM,
} from '../data/otp.data';
import { ICreateOtp } from '../interface/otp.interface';
import * as schema from '@/schemas/schema';
import { eq } from 'drizzle-orm';
import { EValidateOtp } from '@/shared/dtos/event.dto';

@Injectable()
export class OtpProvider {
  private totp: OTPAuth.TOTP;

  constructor(
    private readonly handler: ErrorHandler,
    private readonly eventEmitter: EventEmitter2,
    @Inject(DRIZZLE_PROVIDER) private readonly db: Database,
  ) {
    this.totp = this.initTotp();
  }

  async createOTP(ctx: ICreateOtp) {
    const { emailAddress, code } = ctx;
    try {
      await this.db
        .insert(schema.otp)
        .values({
          emailAddress,
          otpCode: code,
        })
        .onConflictDoUpdate({
          target: schema.otp.emailAddress,
          set: {
            otpCode: code,
          },
        });

      return this.handler.handleReturn({
        status: HttpStatus.OK,
        message: OSM.SUCCESS_CREATING_OTP,
      });
    } catch (e) {
      return this.handler.handleError(e, OEM.ERROR_CREATING_OTP);
    }
  }

  generateSecret() {
    return new OTPAuth.Secret();
  }

  initTotp() {
    return new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: this.generateSecret(),
      digits: 6,
      period: 900,
    });
  }

  generateOtp() {
    return this.totp.generate();
  }

  async validateOtp(otp: string) {
    let isValid: boolean = false;
    const validation = this.totp.validate({ token: otp, window: 1 });
    if (validation !== null && typeof validation == 'number') {
      const otpResult = await this.db
        .select({ emailAddress: schema.otp.emailAddress })
        .from(schema.otp)
        .where(eq(schema.otp.otpCode, otp));

      console.log(otpResult);

      if (!otpResult || otpResult.length === 0) {
        isValid = false;
      }

      isValid = true;
      const emailAddress = otpResult[0].emailAddress;

      this.eventEmitter.emit(
        SharedEvents.VALIDATE_OTP,
        new EValidateOtp(emailAddress),
      );
    }
    return isValid;
  }

  generateOtpWithSecret(secret: OTPAuth.Secret | string) {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: secret,
      digits: 6,
      period: 120,
    });
    return totp.generate();
  }

  validateOtpWithSecret(otp: string, secret: OTPAuth.Secret | string) {
    const totp = new OTPAuth.TOTP({
      issuer: 'allofhealth',
      label: 'allofhealth-api',
      algorithm: 'SHA1',
      secret: secret,
      digits: 6,
      period: 120,
    });
    return totp.validate({ token: otp, window: 1 });
  }
}
