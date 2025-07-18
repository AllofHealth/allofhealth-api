import { Injectable } from '@nestjs/common';
import { HealthInfoProvider } from '../provider/health-info.provider';
import { ICreateHealthInfo } from '../interface/health-info.interface';

@Injectable()
export class HealthInfoService {
  constructor(private readonly healthInfoProvider: HealthInfoProvider) {}

  async createHealthInfo(ctx: ICreateHealthInfo) {
    return await this.healthInfoProvider.createHealthInformation(ctx);
  }
}
