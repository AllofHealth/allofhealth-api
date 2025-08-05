import { Test, TestingModule } from '@nestjs/testing';
import { ResendService } from './resend.service';
import { ResendProvider } from '../provider/resend.provider';
import { RESEND_API_KEY } from '@/shared/data/constants';
import { ResendConfig } from '@/shared/config/resend/resend.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

describe('ResendService', () => {
  let service: ResendService;
  const mockConfig = {
    RESEND_API_KEY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ResendService,
        ResendProvider,
        ErrorHandler,
        {
          provide: ResendConfig,
          useValue: mockConfig,
        },
      ],
    }).compile();

    service = module.get<ResendService>(ResendService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Emails', () => {
    it('Should successfully send an email to outbound domain', async () => {
      const response = await service.sendEmail({
        to: 'preciousegbu@gmail.com',
        body: '23456',
        subject: 'OTP VERIFICATION',
      });

      console.log(response);
      expect(response).toBeDefined();
    }, 5000);
  });
});
