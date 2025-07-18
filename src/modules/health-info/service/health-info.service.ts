import { Injectable } from '@nestjs/common';
import { HealthInfoProvider } from '../provider/health-info.provider';
import {
  ICreateHealthInfo,
  IFetchHealthInfo,
  IUpdateHealthInfo,
} from '../interface/health-info.interface';

@Injectable()
export class HealthInfoService {
  constructor(private readonly healthInfoProvider: HealthInfoProvider) {}

  async createHealthInfo(ctx: ICreateHealthInfo) {
    return await this.healthInfoProvider.createHealthInformation(ctx);
  }

  async updateHealthInfo(ctx: IUpdateHealthInfo) {
    return await this.healthInfoProvider.updateHealthInformation(ctx);
  }

  async fetchHealthInfo(ctx: IFetchHealthInfo) {
    return await this.healthInfoProvider.fetchHealthInformation(ctx);
  }
}
