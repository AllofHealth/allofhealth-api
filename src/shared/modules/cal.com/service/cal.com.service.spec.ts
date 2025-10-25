import { Test, TestingModule } from '@nestjs/testing';
import { CalComService } from './cal.com.service';

describe('CalComService', () => {
  let service: CalComService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalComService],
    }).compile();

    service = module.get<CalComService>(CalComService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
