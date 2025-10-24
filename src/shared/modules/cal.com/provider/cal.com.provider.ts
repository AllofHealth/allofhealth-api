import { CalConfig } from '@/shared/config/cal.com/cal.config';
import { MyLoggerService } from '@/modules/my-logger/service/my-logger.service';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import {
  IHandleCalRequests,
  TCalMethods,
} from '../interface/cal.com.interface';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CalComProvider {
  private readonly logger = new MyLoggerService(CalComProvider.name);
  private readonly apiVersion: string = '2024-08-13';
  constructor(
    private readonly calConfig: CalConfig,
    private readonly httpService: HttpService,
  ) {}

  private getRequestConfig(method: TCalMethods): AxiosRequestConfig {
    return {
      method,
      headers: {
        'content-type': 'application/json',
        Authorization:
          method === 'POST'
            ? `Bearer ${this.calConfig.CALCOM_API_KEY}`
            : undefined,
        'cal-api-version': this.apiVersion,
      },
    };
  }

  baseUrl() {
    return this.calConfig.CALCOM_API_URL;
  }

  async handleCalRequests(ctx: IHandleCalRequests) {
    const { src, method, url, data } = ctx;
    const config: AxiosRequestConfig = {
      ...this.getRequestConfig(method),
      url,
      data,
    };
    try {
      const response: AxiosResponse = await firstValueFrom(
        this.httpService.request(config),
      );

      return response.data;
    } catch (e) {
      this.logger.error(
        `An error occurred while making request to this resource ${src}: ${e} `,
      );
      throw new HttpException(
        `An error occurred while making request to this resource ${src}: ${e}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
