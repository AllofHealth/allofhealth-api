import { Test, TestingModule } from '@nestjs/testing';
import { DailyCoService } from './daily.co.service';

describe('DailyCoService', () => {
  let service: DailyCoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyCoService],
    }).compile();

    service = module.get<DailyCoService>(DailyCoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
