import { Module } from '@nestjs/common';
import { SeedService } from './service/seed.service';
import { SeedProvider } from './provider/seed.provider';

@Module({
  providers: [SeedService, SeedProvider],
})
export class SeedModule {}
