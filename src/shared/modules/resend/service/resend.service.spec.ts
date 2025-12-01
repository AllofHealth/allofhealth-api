import { Test, TestingModule } from '@nestjs/testing';
import { ResendService } from './resend.service';
import { ResendProvider } from '../provider/resend.provider';
import { RESEND_API_KEY } from '@/shared/data/constants';
import { ResendConfig } from '@/shared/config/resend/resend.config';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { IHandleBookingRequest } from '../interface/resend.interface';
import {
  formatDateToReadable,
  formatTimeReadable,
} from '@/shared/utils/date.utils';
import { IcsModule } from '../../ics/ics.module';
import { MyLoggerModule } from '@/modules/my-logger/my-logger.module';

describe('ResendService', () => {
  let service: ResendService;
  const mockConfig = {
    RESEND_API_KEY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [IcsModule, MyLoggerModule],
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

    it.only('Should successfully send booking request email', async () => {
      const date = new Date(Date.now());
      const time = date.getTime();

      const ctx: IHandleBookingRequest = {
        to: 'preciousegbu@gmail.com',
        consultationType: 'General Consultation',
        date: formatDateToReadable(date),
        time: formatTimeReadable(time),
        doctorName: 'Dr Festus',
        patientName: 'Precious Egbu',
      };

      const data = await service.sendBookingEmail({
        ...ctx,
        context: 'BOOKING_CREATED',
      });

      console.log(data);
      expect(data).toBeDefined();
    });
  });
});
