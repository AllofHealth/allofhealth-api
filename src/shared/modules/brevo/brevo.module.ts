import { Module } from '@nestjs/common';
import { Brevo } from './brevo';
import { BrevoService } from './brevo.service';
import { BrevoController } from './brevo.controller';

@Module({
  providers: [Brevo, BrevoService],
  controllers: [BrevoController]
})
export class BrevoModule {}
