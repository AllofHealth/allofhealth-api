import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { forwardRef, Module } from '@nestjs/common';
import { DoctorModule } from '../doctor/doctor.module';
import { RecordsController } from './controller/records.controller';
import { RecordsProvider } from './provider/records.provider';
import { RecordsEncryptionService } from './service/record-encryption.service';
import { RecordsService } from './service/records.service';
import { IpfsModule } from '../ipfs/ipfs.module';
import { ApprovalModule } from '../approval/approval.module';

@Module({
  imports: [DoctorModule, IpfsModule, forwardRef(() => ApprovalModule)],
  providers: [
    RecordsProvider,
    RecordsService,
    RecordsEncryptionService,
    AuthUtils,
    ErrorHandler,
  ],
  controllers: [RecordsController],
})
export class RecordsModule {}
