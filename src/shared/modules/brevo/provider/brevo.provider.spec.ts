import { Test, TestingModule } from '@nestjs/testing';
import { BrevoProvider } from './brevo.provider';
import { BREVO_API_KEY } from '@/shared/data/constants';
import { BrevoConfig } from '@/shared/config/brevo/brevo.config';

describe('BrevoProvider', () => {
  let provider: BrevoProvider;
  const mockBrevoConfig = {
    BREVO_API_KEY,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BrevoProvider,
        {
          provide: BrevoConfig,
          useValue: mockBrevoConfig,
        },
      ],
    }).compile();

    provider = module.get<BrevoProvider>(BrevoProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('Contacts', () => {
    it('Should create a contact', async () => {
      const data = await provider.createContact({
        emailAddress: 'preciousegbu@gmail.com',
      });

      console.log(data);
      expect(data).toBeDefined();
    }, 50000);
  });
});
