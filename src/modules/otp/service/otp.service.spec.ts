import { Test, TestingModule } from '@nestjs/testing';
import { OtpService } from './otp.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

describe('OtpService', () => {
  let service: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtpService, ErrorHandler],
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
  });
});
