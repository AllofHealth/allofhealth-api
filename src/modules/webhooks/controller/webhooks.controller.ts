import { Controller, Post, Request } from '@nestjs/common';
import { WebhooksService } from '../service/webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('calcom')
  async processCalWebhook(@Request() req: any) {
    return await this.webhooksService.procesCalEvents(req);
  }

  @Post('flutter')
  async processFlutterWebhook(@Request() req: any) {
    return await this.webhooksService.processFlutterEvents(req);
  }
}
