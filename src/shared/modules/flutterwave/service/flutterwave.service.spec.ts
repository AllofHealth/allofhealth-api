import { Test, TestingModule } from '@nestjs/testing';
import { FlutterwaveService } from './flutterwave.service';
import {
  FLUTTERWAVE_CLIENT_ID,
  FLUTTERWAVE_CLIENT_SECRET,
  FLUTTERWAVE_ENCRYPTION_KEY,
  FLUTTERWAVE_PROD_BASE_URL,
  FLUTTERWAVE_SANDBOX_BASE_URL,
  FLUTTERWAVE_WEBHOOK_SECRET,
  FLUTTERWAVE_WEBHOOK_URL,
} from '@/shared/data/constants';
import { HttpModule } from '@nestjs/axios';
import { FlutterwaveProvider } from '../provider/flutterwave.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { FlutterwaveConfig } from '@/shared/config/flutterwave/flutterwave.config';
import * as uuid from 'uuid';
import { InitializePayment } from '../interface/flutterwave.interface';
import { MyLoggerModule } from '@/modules/my-logger/my-logger.module';

describe('FlutterwaveService', () => {
  let service: FlutterwaveService;
  const flutterConfig = {
    FLUTTERWAVE_CLIENT_ID,
    FLUTTERWAVE_CLIENT_SECRET,
    FLUTTERWAVE_ENCRYPTION_KEY,
    FLUTTERWAVE_PROD_BASE_URL,
    FLUTTERWAVE_SANDBOX_BASE_URL,
    FLUTTERWAVE_WEBHOOK_SECRET,
    FLUTTERWAVE_WEBHOOK_URL,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule, MyLoggerModule],
      providers: [
        FlutterwaveService,
        FlutterwaveProvider,
        ErrorHandler,
        {
          provide: FlutterwaveConfig,
          useValue: flutterConfig,
        },
      ],
    }).compile();

    service = module.get<FlutterwaveService>(FlutterwaveService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Payments', () => {
    it('Should initialize payment successfully', async () => {
      const paymentData: InitializePayment = {
        amount: 5000,
        currency: 'NGN',
        email: 'preciousegbu@gmail.com',
        name: 'Chike Egbu',
        txRef: uuid.v4(),
      };

      const data = await service.initializePayment(paymentData);
      console.log(data);
      expect(data).toBeDefined();
    }, 50000);
  });
});
