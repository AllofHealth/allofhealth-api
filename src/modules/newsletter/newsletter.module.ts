import { Module } from '@nestjs/common';
import { NewsletterService } from './service/newsletter.service';
import { NewsletterController } from './controller/newsletter.controller';
import { NewsletterProvider } from './provider/newsletter.provider';
import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { BrevoModule } from '@/shared/modules/brevo/brevo.module';

@Module({
  imports: [BrevoModule],
  providers: [NewsletterProvider, NewsletterService, ErrorHandler],
  controllers: [NewsletterController],
})
export class NewsletterModule {}
