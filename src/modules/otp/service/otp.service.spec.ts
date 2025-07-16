import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { OtpProvider } from '../provider/otp.provider';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, ErrorHandler, OtpProvider],
    }).compile();

    service = module.get<OtpService>(OtpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Otp', () => {
    it('Should generate a 6 digit otp string', () => {
      const otp = service.generateOtp();

      console.debug(otp);
      expect(otp).toHaveLength(6);
    });

    it('Should validate a valid otp', () => {
      const otp = service.generateOtp();
      const isValid = service.validateOtp(otp);

      console.log('Generated OTP:', otp);
      console.log('Validation result:', isValid);

      expect(isValid).not.toBeNull();
      expect(isValid).toBe(true);
    });

    it('Should return null for invalid otp', () => {
      const invalidOtp = '123456';
      const isValid = service.validateOtp(invalidOtp);

      expect(isValid).toBe(false);
    });

    it('Should work with user-specific secrets', () => {
      const secret = service.generateSecret();
      const otp = service.generateOtpWithSecret(secret);
      const isValid = service.validateOtpWithSecret(otp, secret);

      console.log('Secret-based OTP:', otp);
      console.log('Secret-based validation:', isValid);

      expect(isValid).not.toBeNull();
      expect(typeof isValid).toBe('number');
    });

    it('Should fail validation with wrong secret', () => {
      const secret1 = service.generateSecret();
      const secret2 = service.generateSecret();
      const otp = service.generateOtpWithSecret(secret1);
      const isValid = service.validateOtpWithSecret(otp, secret2);

      expect(isValid).toBeNull();
    });
  });
});
