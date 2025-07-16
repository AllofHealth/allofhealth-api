import { Test, TestingModule } from '@nestjs/testing';
import { PostmarkProvider } from './postmark.provider';

describe('PostmarkProvider', () => {
  let provider: PostmarkProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostmarkProvider],
    }).compile();

    provider = module.get<PostmarkProvider>(PostmarkProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
