import { Module } from '@nestjs/common';
import { PostmarkProvider } from './provider/postmark.provider';
import { PostmarkService } from './service/postmark.service';

@Module({
  providers: [PostmarkProvider, PostmarkService],
})
export class PostmarkModule {}
