import { Module } from '@nestjs/common';
import { ApprovalService } from './service/approval.service';
import { ApprovalProvider } from './provider/approval.provider';
import { ApprovalController } from './controller/approval.controller';

@Module({
  providers: [ApprovalService, ApprovalProvider],
  controllers: [ApprovalController],
})
export class ApprovalModule {}
