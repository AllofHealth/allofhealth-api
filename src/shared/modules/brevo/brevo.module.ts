import { Module } from '@nestjs/common';
import { BrevoProvider } from './provider/brevo.provider';
import { BrevoService } from './service/brevo.service';
import { BrevoController } from './controller/brevo.controller';

@Module({
  providers: [BrevoProvider, BrevoService, BrevoController],
  exports: [BrevoService],
})
export class BrevoModule {}
