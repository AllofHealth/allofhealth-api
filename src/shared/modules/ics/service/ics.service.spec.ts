import { Test, TestingModule } from '@nestjs/testing';
import { IcsService } from './ics.service';
import { MyLoggerModule } from '@/modules/my-logger/my-logger.module';

describe('IcsService', () => {
  let service: IcsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MyLoggerModule],
      providers: [IcsService],
    }).compile();

    service = module.get<IcsService>(IcsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Ics Generation', () => {
    it('should successfully generate ics', () => {
      const value = service.generateIcsFile({
        title: 'Test Booking Cofirmed',
        description: 'This is a test',
        startTime: new Date(),
        endTime: new Date(),
        url: 'https://example.com',
      });

      console.log(value);
      expect(value).toBeDefined();
    });
  });
});
