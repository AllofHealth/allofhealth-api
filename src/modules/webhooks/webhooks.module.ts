import { Module } from '@nestjs/common';
import { WebhooksService } from './service/webhooks.service';
import { WebhooksController } from './controller/webhooks.controller';

@Module({
  providers: [WebhooksService],
  controllers: [WebhooksController],
})
export class WebhooksModule {}
