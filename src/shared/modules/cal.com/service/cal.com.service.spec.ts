import { Test, TestingModule } from '@nestjs/testing';
import { CalComService } from './cal.com.service';
import { CalComProvider } from '../provider/cal.com.provider';
import { HttpModule } from '@nestjs/axios';
import { MyLoggerModule } from '@/modules/my-logger/my-logger.module';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import {
  CALCOM_API_KEY,
  CALCOM_API_URL,
  CALCOM_CLIENT_ID,
  CALCOM_CLIENT_SECRET,
  CALCOM_EMBED_URL,
  CALCOM_REDIRECT_URI,
  CALCOM_WEBHOOK_SECRET,
  PLACEHOLDER,
} from '@/shared/data/constants';
import { CalConfig } from '@/shared/config/cal.com/cal.config';

describe('CalComService', () => {
  let service: CalComService;
  const CAL_CONFIG = {
    CALCOM_API_KEY,
    CALCOM_API_URL,
    CALCOM_CLIENT_ID,
    CALCOM_CLIENT_SECRET,
    CALCOM_EMBED_URL,
    CALCOM_REDIRECT_URI,
    CALCOM_WEBHOOK_SECRET,
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, MyLoggerModule],
      providers: [
        CalComService,
        CalComProvider,
        ErrorHandler,
        { provide: CalConfig, useValue: CAL_CONFIG },
      ],
    }).compile();

    service = module.get<CalComService>(CalComService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Authentication', () => {
    it('should create a managed user successfully', async () => {
      const response = await service.createManagedUser({
        name: 'Chikezie',
        email: 'preciousegbu@gmail.com',
        avatarUrl: PLACEHOLDER,
      });

      console.log(response);
      expect(response).toBeDefined();
    }, 50000);

    it.only('Should get all managed users successfully', async () => {
      const response = await service.getAllManagedUsers();

      console.log(response);
      expect(response).toBeDefined();
    }, 50000);
  });
});
