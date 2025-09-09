import { Test, TestingModule } from '@nestjs/testing';
import { PushNotificationsProvider } from './push-notifications.provider';

describe('PushNotifications', () => {
  let provider: PushNotificationsProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PushNotificationsProvider],
    }).compile();

    provider = module.get<PushNotificationsProvider>(PushNotificationsProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
