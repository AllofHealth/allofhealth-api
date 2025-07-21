import { Module } from '@nestjs/common';
import { PostmarkProvider } from './provider/postmark.provider';
import { PostmarkService } from './service/postmark.service';
import { ErrorHandler } from '@/shared/error-handler/error.handler';

@Module({
  providers: [PostmarkProvider, PostmarkService, ErrorHandler],
  exports: [PostmarkService],
})
export class PostmarkModule {}
