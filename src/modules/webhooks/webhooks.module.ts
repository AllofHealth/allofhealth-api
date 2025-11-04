import { Module } from '@nestjs/common';
import { WebhooksService } from './service/webhooks.service';
import { WebhooksController } from './controller/webhooks.controller';
import { BookingModule } from '../booking/booking.module';

@Module({
  imports: [BookingModule],
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
