import { Module } from '@nestjs/common';
import { DoctorProvider } from './provider/doctor.provider';
import { DoctorService } from './service/doctor.service';
import { DoctorController } from './controller/doctor.controller';

@Module({
  providers: [DoctorService, DoctorProvider],
  controllers: [DoctorController],
})
export class DoctorModule {}
