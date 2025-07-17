import { ErrorHandler } from '@/shared/error-handler/error.handler';
import { AuthUtils } from '@/shared/utils/auth.utils';
import { forwardRef, Module } from '@nestjs/common';
import { ApprovalModule } from '../approval/approval.module';
import { ContractModule } from '../contract/contract.module';
import { DoctorModule } from '../doctor/doctor.module';
import { IpfsModule } from '../ipfs/ipfs.module';
import { RecordsController } from './controller/records.controller';
import { RecordsProvider } from './provider/records.provider';
import { RecordsEncryptionService } from './service/record-encryption.service';
import { RecordsService } from './service/records.service';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    DoctorModule,
    IpfsModule,
    forwardRef(() => ApprovalModule),
    forwardRef(() => ContractModule),
    forwardRef(() => TokenModule),
  ],
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
