import { Test, TestingModule } from '@nestjs/testing';
import { DoxyService } from './doxy.service';

describe('DoxyService', () => {
  let service: DoxyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DoxyService],
    }).compile();

    service = module.get<DoxyService>(DoxyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
