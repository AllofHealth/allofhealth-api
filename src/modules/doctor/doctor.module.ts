import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { Doctor } from './doctor';
import { DoctorController } from './doctor.controller';

@Module({
  providers: [DoctorService, Doctor],
  controllers: [DoctorController]
})
export class DoctorModule {}
