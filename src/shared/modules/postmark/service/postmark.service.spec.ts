import { Test, TestingModule } from '@nestjs/testing';
import { PostmarkService } from './postmark.service';

describe('PostmarkService', () => {
  let service: PostmarkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostmarkService],
    }).compile();

    service = module.get<PostmarkService>(PostmarkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
