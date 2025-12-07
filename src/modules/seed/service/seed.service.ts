import { Injectable } from '@nestjs/common';
import { SeedProvider } from '../provider/seed.provider';

@Injectable()
export class SeedService {
  constructor(private readonly seedProvider: SeedProvider) {}

  async onModuleInit() {
    try {
      await this.seedProvider.seedAdmins();
    } catch (e) {
      throw e;
    }
  }
}
