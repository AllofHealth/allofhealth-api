import { PostmarkConfig } from '@/shared/config/postmark/postmark.config';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostmarkProvider {
  constructor(private readonly postmarkConfig: PostmarkConfig) {}
}
